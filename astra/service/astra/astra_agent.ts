import { resolve } from "path";

import * as chalk from "chalk";
import { EventEmitter } from "~/common/js/event_emitter";
import { EventRegistry } from "~/common/js/event_registry";
import { Logger, formatLogger } from "~/common/js/logger";
import { ensureDir, exists, readJson, writeJson } from "~/common/node/fs";

import {
  Agent,
  AgentNext,
  AgentState,
  AgentToolCallEvent,
} from "../agent/agent";
import { AgentTool } from "../agent/agent_tool";
import { AgentTools } from "../agent/agent_tools";
import { Llm, hasAnyToolCall, removeToolCalls } from "../llm/llm";
import { Sandbox } from "../sandbox/sandbox";

import {
  getMainAgentSystemPrompt,
  getSummaryPrompt,
  getVerificationPrompt,
  getWorkerAgentSystemPrompt,
} from "./astra_agent_prompts";

export interface AstraAgentOptions {
  taskMaxIters: number;
  mainAgentTools?: AgentTool[];
}

export type AstraAgentStatus = "done" | "failed" | "timeout";

export type AstraAgentResultsStatus = "correct" | "incorrect" | "timeout";
export interface AstraAgentState {
  mainAgent: Record<string, any>;
  workerAgent: Record<string, any>;
}

export interface AstraAgentEvent {
  agent: AstraAgent;
}

export interface AstraAgentTaskEvent extends AstraAgentEvent {
  task?: string;
}

export interface AstraAgentJobEvent extends AstraAgentEvent {
  job?: string;
}

export type AstraAgentEvents = {
  task: (e: AstraAgentTaskEvent) => void;
  job: (e: AstraAgentJobEvent) => void;
};

export class AstraAgent extends EventRegistry<AstraAgentEvents> {
  protected emitter = new EventEmitter<AstraAgentEvents>(this);

  public mainAgent!: Agent;
  public workerAgent!: Agent;
  public summaryAgent!: Agent;
  public verificationAgent!: Agent;

  constructor(
    public readonly options: AstraAgentOptions,
    public readonly sandbox: Sandbox,
    public readonly agentTools: AgentTools,
    public readonly logger: Logger,
    public readonly llm: Llm,
  ) {
    super();
    this.mainAgent = new Agent(
      this.llm,
      formatLogger(this.logger, { prefix: chalk.cyanBright("main") }),
      this.sandbox,
    );
    this.workerAgent = new Agent(
      this.llm,
      formatLogger(this.logger, { prefix: chalk.cyanBright("worker") }),
      this.sandbox,
    );
    this.summaryAgent = new Agent(
      this.llm,
      formatLogger(this.logger, { prefix: chalk.cyanBright("summary") }),
      this.sandbox,
    );
    this.verificationAgent = new Agent(
      this.llm,
      formatLogger(this.logger, { prefix: chalk.cyanBright("verification") }),
      this.sandbox,
    );
    this.mainAgent.on("toolCall", this.onAgentToolCall);
    this.workerAgent.on("toolCall", this.onAgentToolCall);
    this.summaryAgent.on("toolCall", this.onAgentToolCall);
    this.verificationAgent.on("toolCall", this.onAgentToolCall);
  }

  private onAgentToolCall = (e: AgentToolCallEvent): void => {
    this.emitJob(e.tool.id);
  };

  private emitTask = (task?: string): void => {
    this.emitter.emit("task", {
      agent: this,
      task,
    });
    this.emitJob();
  };

  private emitJob = (job?: string): void => {
    this.emitter.emit("job", {
      agent: this,
      job,
    });
  };

  public get state(): AstraAgentState {
    return {
      mainAgent: this.mainAgent.state.toJson(),
      workerAgent: this.workerAgent.state.toJson(),
    };
  }

  public async save(path: string): Promise<void> {
    await ensureDir(path);
    const statePath = resolve(path, "state.json");
    await writeJson(statePath, this.state, true);
  }

  public async load(path: string): Promise<void> {
    const statePath = resolve(path, "state.json");
    if (!(await exists(statePath))) return;
    const state = await readJson<AstraAgentState>(statePath);
    this.mainAgent.state = AgentState.fromJson(state.mainAgent);
    this.workerAgent.state = AgentState.fromJson(state.workerAgent);
  }

  public async next(): Promise<AgentNext> {
    // while (true) {
    const nextOptions = {
      systemPrompt: getMainAgentSystemPrompt(this.mainAgent),
      tools: this.getMainAgentTools(),
      maxTokens: 1024,
      temperature: 0.5,
    };
    const res = await this.mainAgent.next({
      ...nextOptions,
      ctx: this.mainAgent.buildContext(nextOptions),
    });
    return res;
    // await this.save();
    // if (
    //   this.mainAgent.state.ctx.messages.length === 0 ||
    //   (res.length > 0 &&
    //     !res.some((r) => r.role === "assistant" && r.toolCalls != null))
    // ) {
    //   const userPrompt = await prompt({
    //     type: "input",
    //     name: "userPrompt",
    //     message: "User prompt: ",
    //   }).then((res: any) => res["userPrompt"]);
    //   this.mainAgent.state.addMessage({
    //     role: "user",
    //     content: userPrompt,
    //   });
    // }
    // }
  }

  public getMainAgentTools(): AgentTool[] {
    return [
      ...(this.options.mainAgentTools ?? []),
      {
        id: "delegate_task",
        description: `
Delegates a task to some worker.
Workers do not have any insight into this conversation.
Workers have full capabilities and operate in a sandbox with Linux.
You share the file system with workers.
  `.trim(),
        arguments: {
          description: {
            type: "string",
            description: `Short task description.`,
            required: true,
          },
          context: {
            type: "string",
            description: `Fully exhaustive task description including any relevant information.`,
            required: true,
          },
          // inputs: {
          //   type: "string",
          //   description: `Task relevant inputs. Can be files (absolute paths) or urls.`,
          // },
          // outputs: {
          //   type: "string",
          //   description: `Task relevant outputs.`,
          // },
          // output_files: {
          //   type: "string",
          //   description: `Task relevant output files. Must be absolute paths.`,
          // },
          // urls: {
          //   type: "string",
          //   description: `Task relevant urls.`,
          // },
          input_files: {
            type: "string",
            description: `Task relevant input files. Must be absolute paths.`,
          },
          output_files: {
            type: "string",
            description: `Task relevant output files. Must be absolute paths.`,
          },
          urls: {
            type: "string",
            description: `Task relevant urls.`,
          },
        },
        impl: async (ctx): Promise<void> => {
          const task = JSON.stringify(ctx.args, null, 2);
          const worker = this.workerAgent;
          worker.state.addMessage({
            role: "user",
            content: `<task>\n${task}\n</task>`,
          });
          worker.state.iter = 0;
          const taskDescription = ctx.args["context"];
          this.emitTask(taskDescription ?? JSON.stringify(ctx.args));

          while (true) {
            const nextOptions = {
              systemPrompt: getWorkerAgentSystemPrompt(worker),
              tools: this.getWorkerAgentTools(),
              maxTokens: 1024,
              temperature: 0.7,
              onlyOneUserMessage: true,
            };

            const { messages } = await worker.next({
              ...nextOptions,
              ctx: worker.buildContext(nextOptions),
            });

            if (messages.some(hasAnyToolCall)) continue;

            let status = worker.state.get<AstraAgentStatus>("status");

            if (
              status == null &&
              worker.state.iter > this.options.taskMaxIters
            ) {
              status = "timeout";
            }

            if (
              status != null &&
              (["timeout", "done", "failed"] as AstraAgentStatus[]).includes(
                status,
              )
            ) {
              worker.state.ctx.messages = removeToolCalls(
                worker.state.ctx.messages,
                ["done", "failed"],
              );

              this.summaryAgent.withState(worker.state.clone());
              this.summaryAgent.state.addMessage({
                role: "user",
                content: getSummaryPrompt(status, task),
              });
              this.emitJob("getting results");
              const { messages } = await this.summaryAgent.next({
                ...nextOptions,
                tools: [],
                ctx: this.summaryAgent.buildContext(nextOptions),
              });
              this.emitJob(status);

              const taskResults = messages[0]?.content ?? "No results";
              ctx.out.text(taskResults);

              // if (status === "done") {
              //   const verification = await this.runVerificationAgent(
              //     task,
              //     taskResults,
              //   );

              //   ctx.out.text(taskResults);
              //   if (!verification.correct) {
              //     ctx.out.text(
              //       `Results are incorrect. Reason: ${verification.text}`,
              //     );
              //   }
              // }

              break;
            }
          }
        },
      },
    ];
  }

  private async runVerificationAgent(
    task: string,
    taskResults: string,
  ): Promise<{ correct: boolean; text: string | undefined }> {
    let correct = false;
    this.emitJob("verifying results");

    // this.verificationAgent.withState(this.workerAgent.state.clone());
    this.verificationAgent.withState();
    this.verificationAgent.state.iter = 0;
    this.verificationAgent.state.addMessage({
      role: "user",
      content: getVerificationPrompt(task, taskResults),
    });

    const nextOptions = {
      systemPrompt: getWorkerAgentSystemPrompt(this.workerAgent),
      tools: this.getVerificationAgentTools(),
      maxTokens: 512,
      temperature: 0.3,
      onlyOneUserMessage: true,
    };

    while (true) {
      const { messages } = await this.verificationAgent.next({
        ...nextOptions,
        ctx: this.verificationAgent.buildContext(nextOptions),
      });

      if (messages.some(hasAnyToolCall)) continue;

      let status =
        this.verificationAgent.state.get<AstraAgentResultsStatus>("status");

      if (
        status == null &&
        this.verificationAgent.state.iter > this.options.taskMaxIters
      ) {
        status = "timeout";
      }

      if (
        status != null &&
        (
          ["timeout", "correct", "incorrect"] as AstraAgentResultsStatus[]
        ).includes(status)
      ) {
        this.verificationAgent.state.ctx.messages = removeToolCalls(
          this.verificationAgent.state.ctx.messages,
          ["incorrect", "correct"],
        );

        correct = status === "correct";

        break;
      }
    }

    this.emitJob("done");

    const text = this.verificationAgent.state.get<string>("results");
    return { correct, text };
  }

  private getWorkerAgentTools(): AgentTool[] {
    return [
      this.agentTools.sandbox.writeFile(),
      this.agentTools.sandbox.exec(),
      this.agentTools.sandbox.execPython(),
      this.agentTools.browser.download(),
      this.agentTools.browser.webSearch(),
      this.agentTools.browser.newsSearch(),
      this.agentTools.browser.imageSearch(),
      this.agentTools.browser.browserGoTo(),
      this.agentTools.browser.browserGetText(),
      this.agentTools.browser.browserGetLinks(),
      this.agentTools.browser.browserEvalJs(),
      {
        id: "failed",
        description: "Mark the task as failed",
        impl: async (ctx): Promise<void> => {
          ctx.agent.state.set<AstraAgentStatus>("status", "failed");
        },
      },
      {
        id: "done",
        description: "Mark the task as done",
        impl: async (ctx): Promise<void> => {
          ctx.agent.state.set<AstraAgentStatus>("status", "done");
        },
      },
    ];
  }

  private getVerificationAgentTools(): AgentTool[] {
    return [
      this.agentTools.sandbox.exec(),
      this.agentTools.sandbox.execPython(),
      {
        id: "incorrect",
        description: "Mark the results as incorrect",
        arguments: {
          description: {
            type: "string",
            description: `Describe the reason you failed.`,
            required: true,
          },
        },
        impl: async (ctx): Promise<void> => {
          const results = ctx.args["description"] ?? "";
          ctx.agent.state.set<AstraAgentResultsStatus>("status", "incorrect");
          ctx.agent.state.set<string>("results", results);
        },
      },
      {
        id: "correct",
        description: "Mark the results as done",
        arguments: {
          description: {
            type: "string",
            description: `Describe why you succeeded.`,
            required: true,
          },
        },
        impl: async (ctx): Promise<void> => {
          const results = ctx.args["description"] ?? "";
          ctx.agent.state.set<AstraAgentResultsStatus>("status", "correct");
          ctx.agent.state.set<string>("results", results);
        },
      },
    ];
  }

  public async stopImmediately(): Promise<void> {
    await this.mainAgent.stopImmediately();
  }
}
