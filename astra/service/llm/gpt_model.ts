import gptTokenizer from "gpt-tokenizer";
import OpenAI from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { tryParseJson } from "~/common/js/json";

import {
  LlmGenerateOptions,
  LlmMessage,
  Llm,
  LlmTool,
  Tokenizer,
  LlmToolCall,
} from "./llm";

export class GptTokenizer implements Tokenizer {
  public encode(text: string): number[] {
    return gptTokenizer.encode(text);
  }

  public decode(tokens: number[]): string {
    return gptTokenizer.decode(tokens);
  }
}

export type GptModelKind = ChatCompletionCreateParamsBase["model"];

export const asGptToolCall = (
  toolCall: LlmToolCall,
): OpenAI.Chat.Completions.ChatCompletionMessageToolCall => {
  return {
    id: toolCall.id,
    type: "function",
    function: {
      name: toolCall.tool,
      arguments:
        typeof toolCall.args === "string"
          ? toolCall.args
          : JSON.stringify(toolCall.args),
    },
  };
};

export const asGptMessage = (
  message: LlmMessage,
): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
  const gptMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: message.role,
    content: message.content,
  } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
  if (message.toolCalls != null) {
    (gptMessage as any).tool_calls = message.toolCalls.map(asGptToolCall);
  }
  if (message.toolCallId != null) {
    (gptMessage as any).tool_call_id = message.toolCallId;
  }
  return gptMessage;
};

export const asLlmMessage = (
  gptChoice: OpenAI.Chat.Completions.ChatCompletion.Choice,
): LlmMessage => {
  const message: LlmMessage = {
    role: gptChoice.message.role,
    content: gptChoice.message.content,
  };
  if (gptChoice.message.tool_calls != null) {
    message.toolCalls = gptChoice.message.tool_calls.map(asLlmToolCall);
  }
  return message;
};

export const asLlmToolCall = (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
): LlmToolCall => {
  return {
    id: toolCall.id,
    tool: toolCall.function.name,
    args:
      tryParseJson(toolCall.function.arguments) ??
      (typeof toolCall.function.arguments === "string"
        ? toolCall.function.arguments
        : JSON.stringify(toolCall.function.arguments)),
  };
};

export const asGptTool = (
  tool: LlmTool,
): OpenAI.Chat.Completions.ChatCompletionTool => {
  const args = tool.arguments ?? {};
  return {
    type: "function",
    function: {
      name: tool.id,
      description: tool.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(args).map(([name, arg]) => {
            return [
              name,
              {
                type: arg.type,
                description: arg.description,
              },
            ];
          }),
        ),
        required: Object.entries(args)
          .filter(([, arg]) => arg.required)
          .map(([name]) => name),
      },
    },
  };
};

export class GptModel implements Llm {
  constructor(
    public readonly kind: GptModelKind,
    private readonly openAiClient: OpenAI,
  ) {}

  public getKnowledgeCutOff(): Date | undefined {
    switch (this.kind) {
      case "gpt-4-1106-preview": {
        // https://community.openai.com/t/data-cutoff-date-in-1106-models/513443
        // April 2023
        return new Date("2023-04-01");
      }
      case "gpt-4-0314":
      case "gpt-4-0613":
      case "gpt-3.5-turbo-0301":
      case "gpt-3.5-turbo-0613":
      case "gpt-3.5-turbo-1106":
      case "gpt-3.5-turbo-16k-0613": {
        // https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35-turbo-model-availability
        // September 2021
        return new Date("2021-09-01");
      }
    }
    return undefined;
  }

  public getContextSize(): number | undefined {
    switch (this.kind) {
      case "gpt-4-1106-preview":
      case "gpt-3.5-turbo-16k-0613": {
        return 16384;
      }
      case "gpt-4-0613": {
        return 8192;
      }
      case "gpt-3.5-turbo-1106":
      case "gpt-3.5-turbo-0613": {
        return 4096;
      }
    }
    return undefined;
  }

  public getTokenizer(): GptTokenizer {
    return new GptTokenizer();
  }

  public async generate(options: LlmGenerateOptions): Promise<LlmMessage[]> {
    const gptCtx: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      options.ctx.messages.map(asGptMessage);

    let gptTools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined =
      undefined;
    if (options.tools != null && options.tools.length > 0) {
      gptTools = options.tools.map(asGptTool);
    }

    const { choices } = await this.openAiClient.chat.completions.create({
      model: this.kind,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      messages: gptCtx,
      tools: gptTools,
      // response_format:
      //   options.format === "json" ? { type: "json" } : { type: "text" },
    });
    return choices.map(asLlmMessage);
  }
}
