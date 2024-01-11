import {
  Llm,
  LlmMessage,
  LlmTool,
  LlmToolCall,
  parseLlmToolArguments,
} from "../llm/llm";
import { Sandbox } from "../sandbox/sandbox";

import { Agent } from "./agent";
import { Artifact, ArtifactType } from "./agent_tool_artifact";

export interface AgentTool extends LlmTool {
  impl(ctx: AgentToolContext): Promise<void> | void;
}

export class AgentToolContextOut {
  public artifacts: Artifact[] = [];

  public add(artifact: Artifact): void {
    this.artifacts.push(artifact);
  }

  public text(text: string): Artifact {
    const r: Artifact = {
      type: ArtifactType.Text,
      data: text,
    };
    this.add(r);
    return r;
  }

  public json(data: any): Artifact {
    const r: Artifact = {
      type: ArtifactType.Json,
      data,
    };
    this.add(r);
    return r;
  }

  public image(buffer: Buffer, description?: string): Artifact {
    const r: Artifact = {
      type: ArtifactType.Image,
      buffer,
      description,
    };
    this.add(r);
    return r;
  }

  public any(data: any): Artifact {
    if (typeof data === "object") {
      return this.json(data);
    }
    return this.text(data);
  }
}

export class AgentToolContext {
  public readonly out: AgentToolContextOut = new AgentToolContextOut();
  public readonly args: Record<string, any>;

  constructor(
    args: Record<string, any>,
    public readonly agent: Agent,
    public readonly tool: AgentTool,
    public readonly callee: [LlmMessage, LlmToolCall],
    public readonly sandbox: Sandbox,
  ) {
    this.args = parseLlmToolArguments(tool, args);
  }
}
