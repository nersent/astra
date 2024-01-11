import { asArray, getLastItem, pushSet } from "~/common/js/array";

export interface Tokenizer {
  encode(text: string): number[];
  decode(tokens: number[]): string;
}

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: any;
  toolCalls?: LlmToolCall[];
  toolCallId?: string;
} & Record<string, any>;

export interface LlmToolCall {
  id: string;
  tool: string;
  args: Record<string, any> | string;
}

export type LlmContext = { messages: LlmMessage[] };

export type LlmGenerateFormat = "json" | "text";

export interface LlmGenerateOptions {
  ctx: LlmContext;
  maxTokens?: number;
  temperature?: number;
  tools?: LlmTool[];
  format?: LlmGenerateFormat;
}

export interface Llm {
  getKnowledgeCutOff(): Date | undefined;
  getContextSize(): number | undefined;
  getTokenizer(): Tokenizer;
  generate(options: LlmGenerateOptions): Promise<LlmMessage[]>;
}

export interface LlmTool {
  id: string;
  description?: string;
  arguments?: Record<string, LlmToolArgument>;
  args?: Record<string, LlmToolArgument>;
}

export interface LlmToolArgument {
  description?: string;
  required?: boolean;
  default?: any;
  type: "string" | "number" | "boolean" | "object";
}

export const createLlmToolSignature = (tool: LlmTool): string => {
  let sig = "";
  sig += `${tool.id}(`;
  if (tool.arguments != null) {
    sig += Object.entries(tool.arguments)
      .map(
        ([name, arg]) =>
          `${name}: ${arg.type}${arg.required ? "" : "?"}${
            arg.default != null ? ` = ${JSON.stringify(arg.default)}` : ""
          }`,
      )
      .join(", ");
  }
  sig += `)`;
  if (tool.description != null) {
    sig += ` - ${tool.description}`;
  }
  return sig;
};

export const parseLlmToolArguments = (
  tool: LlmTool,
  args: Record<string, any>,
): Record<string, any> => {
  const toolArgs = tool.arguments ?? {};
  for (const [argName, argDef] of Object.entries(toolArgs)) {
    if (argDef.required && !(argName in args)) {
      throw new Error(`Missing required argument: ${argName}`);
    }
    if (!argDef.required && !(argName in args)) {
      args[argName] = argDef.default;
    }
  }
  return args;
};

export const formatKnowledgeCutOffPrompt = (
  knowledgeCutOff: Date | undefined,
): string => {
  return `
  ${
    knowledgeCutOff != null
      ? `You have knowledge cut off at ${knowledgeCutOff.toLocaleString(
          "pl-PL",
        )}\n`
      : ""
  }Current date: ${new Date().toLocaleString("pl-PL")}`.trim();
};

export const truncateMessage = (
  text: string,
  tokenizer: Tokenizer,
  maxTokens: number,
): string => {
  const tokens = tokenizer.encode(text);
  if (tokens.length <= maxTokens) {
    return text;
  }
  const truncatedTokens = tokens.slice(0, maxTokens);
  const leftCount = tokens.length - truncatedTokens.length;
  const decoded = tokenizer.decode(truncatedTokens);
  const message = decoded + `... [truncated, ${leftCount} tokens left]`;
  return message;
};

export interface TruncateMessageHistoryOptions {
  messages: LlmMessage[];
  tokenizer: Tokenizer;
  maxContextSize: number;
  stride?: number;
}

export const truncateMessageHistory = (
  options: TruncateMessageHistoryOptions,
): LlmMessage[] => {
  const { messages: allMessages, tokenizer, maxContextSize } = options;
  const stride = options.stride ?? 0;
  const messages: LlmMessage[] = [];

  const currentCtxSize = 0;

  for (let i = allMessages.length - 1; i >= 0; i--) {
    const message = allMessages[i];
    const tokens = tokenizer.encode(message.content ?? "").length;
    if (currentCtxSize + tokens + stride > maxContextSize) {
      break;
    }
    messages.unshift(message);
  }

  while (messages.length > 0) {
    const firstMessage = messages[0];
    if (firstMessage?.role === "tool") {
      messages.shift();
      continue;
    }
    break;
  }

  const lastMessage = getLastItem(messages);
  if (lastMessage?.role === "assistant" && lastMessage.toolCalls != null) {
    messages.pop();
  }

  return messages;
};

export const removeToolCalls = (
  allMessages: LlmMessage[],
  toolToRemove: string | string[],
): LlmMessage[] => {
  const toolsToRemove = new Set<string>(asArray(toolToRemove));
  const messages: LlmMessage[] = [];

  const callIds = new Set<string>();

  for (const message of allMessages) {
    const _message: LlmMessage = { ...message };
    if (message.role === "assistant" && _message.toolCalls != null) {
      for (const toolCall of _message.toolCalls) {
        if (toolsToRemove.has(toolCall.tool)) {
          callIds.add(toolCall.id);
          const index = _message.toolCalls.indexOf(toolCall);
          _message.toolCalls.splice(index, 1);
        }
      }
      if (_message.toolCalls.length === 0) continue;
    } else if (message.role === "tool" && message.toolCallId != null) {
      if (callIds.has(message.toolCallId)) continue;
    }
    messages.push(_message);
  }

  return messages;
};

export const hasAnyToolCall = (message: LlmMessage): boolean => {
  return message["toolCalls"] != null && message["toolCalls"]?.length > 0;
};
