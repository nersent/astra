import { Injectable } from "@nestjs/common";

import { BrowserTools } from "./tools/browser_tools";
import { SandboxTools } from "./tools/sandbox_tools";
import { TextTools } from "./tools/text_tools";

@Injectable()
export class AgentTools {
  constructor(
    public readonly text: TextTools,
    public readonly sandbox: SandboxTools,
    public readonly browser: BrowserTools,
  ) {}
}
