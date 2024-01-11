import * as chalk from "chalk";
import { asArray, getLastItem } from "~/common/js/array";
import { EventEmitter } from "~/common/js/event_emitter";
import { EventRegistry } from "~/common/js/event_registry";
import { Logger } from "~/common/js/logger";
import { deepCopy } from "~/common/js/object";
import { writeJson } from "~/common/node/fs";

import {
  Llm,
  LlmContext,
  LlmGenerateOptions,
  LlmMessage,
  LlmToolCall,
  hasAnyToolCall,
  truncateMessage,
  truncateMessageHistory,
} from "../llm/llm";
import { Sandbox } from "../sandbox/sandbox";

import { AgentTool, AgentToolContext } from "./agent_tool";
import { Artifact, artifactToText } from "./agent_tool_artifact";

export type AgentNextOptions = {
  systemPrompt: string;
  maxTokens?: number;
  tools: AgentTool[];
  // atLeastOneUserMessage?: boolean;
  onlyOneUserMessage?: boolean;
} & Omit<LlmGenerateOptions, "format" | "tools">;

export type AgentNext = {
  agent: Agent;
  messages: LlmMessage[];
};

export class AgentState {
  public ctx: LlmContext = { messages: [] };
  public data = new Map<string, any>();

  public get iter(): number {
    return this.data.get("iter") ?? 0;
  }

  public set iter(value: number) {
    this.data.set("iter", value);
  }

  public addMessage(message: LlmMessage | LlmMessage[]): void {
    this.ctx.messages.push(...asArray(message));
  }

  public set<T>(key: string, value: T): AgentState {
    this.data.set(key, value);
    return this;
  }

  public get<T>(key: string): T | undefined {
    return this.data.get(key);
  }

  public clone(): AgentState {
    const state = new AgentState();
    state.ctx = deepCopy(this.ctx);
    state.data = new Map(this.data);
    return state;
  }

  public toJson(): any {
    return {
      ctx: this.ctx,
      data: Array.from(this.data.entries()),
    };
  }

  public static fromJson(json: any): AgentState {
    const state = new AgentState();
    state.ctx = json.ctx;
    state.iter = json.iter;
    state.data = new Map(json.data);
    return state;
  }
}

export interface AgentEvent {
  agent: Agent;
}

export interface AgentToolCallEvent extends AgentEvent {
  callee: LlmToolCall;
  tool: AgentTool;
  ctx: AgentToolContext;
}

export type AgentEvents = {
  stopImmediately: () => Promise<void>;
  toolCall: (e: AgentToolCallEvent) => Promise<void> | void;
};

export class Agent extends EventRegistry<AgentEvents> {
  protected readonly emitter = new EventEmitter<AgentEvents>(this);

  public state: AgentState = new AgentState();

  constructor(
    public readonly llm: Llm,
    public readonly logger: Logger,
    public readonly sandbox: Sandbox,
  ) {
    super();
  }

  public withState(state?: AgentState): Agent {
    this.state = state ?? new AgentState();
    return this;
  }

  private async handleToolCalls(
    { tools }: AgentNextOptions,
    toolCalls: LlmToolCall[],
    toolCallMessage: LlmMessage,
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      let error: string | undefined;
      let toolCtx: AgentToolContext | undefined;

      this.logger.verbose(
        chalk.blackBright(
          `Running tool ${toolCall.tool} with args:`,
          JSON.stringify(toolCall.args),
        ),
      );

      try {
        const tool = tools.find((r) => r.id === toolCall.tool);
        if (tool == null) {
          throw new Error(`Tool ${toolCall.tool} not found`);
        }
        const args =
          typeof toolCall.args === "string"
            ? { args: toolCall.args }
            : toolCall.args;

        toolCtx = new AgentToolContext(
          args,
          this,
          tool,
          [toolCallMessage, toolCall],
          this.sandbox,
        );

        this.emitter.emit("toolCall", {
          agent: this,
          callee: toolCall,
          tool,
          ctx: toolCtx,
        });

        await tool.impl(toolCtx);

        this.logger.log(chalk.blackBright(`Tool ${tool.id} finished`));
        const outStr = toolCtx.out.artifacts
          .map((r) => artifactToText(r))
          .join("\n");
        this.logger.log(chalk.blackBright(outStr));
      } catch (e) {
        if (e instanceof Error) {
          error = e.message;
        } else {
          error = JSON.stringify(e, null, 2);
        }
        this.logger.verbose(
          chalk.redBright(`Tool ${toolCall.tool} failed\n${error}`),
        );
      }

      const artifacts = toolCtx?.out.artifacts ?? [];

      this.state.addMessage({
        role: "tool",
        toolCallId: toolCall.id,
        artifacts,
        error,
      });
    }
  }

  public buildContext(options: Omit<AgentNextOptions, "ctx">): LlmContext {
    const tokenizer = this.llm.getTokenizer();
    const maxContextSize = this.llm.getContextSize() ?? 4096;

    let allMessages = this.state.ctx.messages;
    const messages: LlmMessage[] = [];

    let _lastUserMessage: LlmMessage | undefined;

    if (options.onlyOneUserMessage) {
      _lastUserMessage = getLastItem(
        allMessages.filter((r) => r.role === "user"),
      );
      if (_lastUserMessage != null) {
        allMessages = allMessages.filter(
          (r) => r.role !== "user" || r === _lastUserMessage,
        );
        // allMessages.push(lastUserMessage);
      }
    }

    for (const [i, originalMessage] of allMessages.entries()) {
      const message = { ...originalMessage };

      if (message.role === "tool") {
        const error = message["error"];
        const artifacts: Artifact[] = message["artifacts"] ?? [];
        const out = [
          ...(artifacts.map((r) => {
            let text = artifactToText(r);
            text = truncateMessage(text, tokenizer, 512);
            return text;
          }) ?? []),
          error,
        ]
          .filter((r) => r != null)
          .join("\n");

        message.content = out;
      }

      messages.push(message);
    }

    const stride = (options.maxTokens ?? 0) + 512;

    const truncatedMessages = truncateMessageHistory({
      messages,
      tokenizer,
      maxContextSize,
      stride,
    });

    if (_lastUserMessage != null) {
      const hasUserMessage = truncatedMessages.some((r) => r.role === "user");
      if (!hasUserMessage) {
        truncatedMessages.unshift(_lastUserMessage);
      }
    }

    // if (options.atLeastOneUserMessage) {
    //   const hasUserMessage = truncatedMessages.some((r) => r.role === "user");
    //   if (!hasUserMessage) {
    //     const lastUserMessage = getLastItem(
    //       messages.filter((r) => r.role === "user"),
    //     );
    //     if (lastUserMessage != null) {
    //       truncatedMessages.unshift(lastUserMessage);
    //     }
    //   }
    // }

    truncatedMessages.unshift({
      role: "system",
      content: options.systemPrompt.trim(),
    });

    return {
      messages: truncatedMessages,
    };
  }

  public async next(options: AgentNextOptions): Promise<AgentNext> {
    const { ctx } = options;

    this.state.iter++;

    this.logger.verbose(
      chalk.blackBright(`[next] iteration: ${this.state.iter}`),
    );

    const next: AgentNext = {
      agent: this,
      messages: [],
    };

    const shouldPromptUser = this.state.ctx.messages.length === 0;
    if (shouldPromptUser) {
      return next;
    }

    const lastMessage = getLastItem(this.state.ctx.messages);

    if (lastMessage?.role === "assistant" && hasAnyToolCall(lastMessage)) {
      await this.handleToolCalls(options, lastMessage.toolCalls!, lastMessage);
    } else {
      this.logger.verbose(chalk.blackBright(JSON.stringify(ctx, null, 2)));
      const messages = await this.llm.generate({
        ctx,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        tools: options.tools,
      });
      this.logger.verbose(
        chalk.blackBright(`out:\n${JSON.stringify(messages, null, 2)}`),
      );
      this.state.addMessage(messages);
      next.messages = messages;
    }

    return next;
  }

  public async stopImmediately(): Promise<void> {
    await this.emitter.emitAsync("stopImmediately");
  }
}
