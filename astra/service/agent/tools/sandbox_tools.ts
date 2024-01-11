import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { secondsToMs, withTimeout } from "~/common/js/time";
import { getExtension } from "~/common/node/fs";

import { ConfigService } from "../../config_service";
import { AgentTool } from "../agent_tool";
import { ArtifactType } from "../agent_tool_artifact";

@Injectable()
export class SandboxTools {
  constructor(private readonly configService: ConfigService) {}

  public exec(): AgentTool {
    return {
      id: "exec",
      description:
        "Executes a command in non interactive, text only linux environment. Do not use interactive commands like nano, vim, etc. because you are gonna get stuck.",
      arguments: {
        command: {
          type: "string",
          required: true,
        },
      },
      impl: async (ctx): Promise<void> => {
        const command = ctx.args["command"] as string;

        await withTimeout(async (): Promise<void> => {
          const ignored = ["python", "python3", "node"].includes(
            command.trim(),
          );

          const data = ignored
            ? { stdout: "", exitCode: 0 }
            : await ctx.agent.sandbox.exec(
                // `yes | ${command}`,
                `${command}`,
              );

          let stdout = data.stdout;
          const successful = data.exitCode === 0;

          if (!ignored && successful) {
            if (command.includes("pip") && command.includes("install")) {
              stdout = "";
            } else if (command.includes("npm") && command.includes("install")) {
              stdout = "";
            } else if (
              command.includes("yarn") &&
              command.includes("install")
            ) {
              stdout = "";
            } else if (
              command.includes("apt-get") &&
              command.includes("install")
            ) {
              stdout = "";
            } else if (
              command.includes("apt-get") &&
              command.includes("update")
            ) {
              stdout = "";
            }
          }

          ctx.out.add({
            type: ArtifactType.Command,
            command,
            stdout,
            exitCode: data.exitCode ?? 0,
          });
        }, secondsToMs(60));
      },
    };
  }

  public writeFile(): AgentTool {
    return {
      id: "save_file",
      description: "Saves a file at given path. Use it instead of echo.",
      arguments: {
        text: {
          type: "string",
          description: "Source code",
          required: true,
        },
        path: {
          type: "string",
          description: "Absolute path",
          required: true,
        },
      },
      impl: async (ctx): Promise<void> => {
        const { text, path } = ctx.args;
        const ext = getExtension(path);
        // if (
        //   ![
        //     "py",
        //     "js",
        //     "ts",
        //     "tsx",
        //     "jsx",
        //     "html",
        //     "css",
        //     "json",
        //     "txt",
        //   ].includes(ext)
        // ) {
        //   throw new Error(`File extension is not supported: ${ext}`);
        // }
        const res = await ctx.sandbox.writeFile(path, text);
        const exitCode = res.exitCode ?? 0;
        ctx.out.add({
          type: ArtifactType.Command,
          stdout: res.stdout,
          exitCode,
        });
        if (exitCode === 0) {
          ctx.out.text(`Saved file at ${path}`);
        }
      },
    };
  }

  public execPython(): AgentTool {
    return {
      id: "python",
      description: `
Executes Python code as actual Python file.
`.trim(),
      arguments: {
        code: {
          type: "string",
          description: `
You MUST use \`plt.savefig(PATH)\` to save plots.
`.trim(),
          required: true,
        },
        // path: {
        //   type: "string",
        //   description: "Absolute path to file. Default: /mnt/data/main.py",
        //   required: false,
        //   default: "/mnt/data/main.py",
        // },
      },
      impl: async (ctx): Promise<void> => {
        const code = ctx.args["code"] as string;
        let path = "/mnt/data/main.py";
        {
          const _code = code.trim();
          if (_code.startsWith("python3 ") || _code.startsWith("python ")) {
            path = _code.split(" ")[1]?.trim();
            if (!(await ctx.sandbox.exists(path))) {
              throw new Error(`File not found: ${path}`);
            }
          }
        }
        if (code.includes("plt.show()") && !code.includes("plt.savefig(")) {
          throw new Error("You MUST use `plt.savefig(PATH)` to save plots.");
        }
        await ctx.sandbox.writeFile(path, code);
        const res = await ctx.sandbox.exec(`python3 ${path}`);
        ctx.out.add({
          type: ArtifactType.Command,
          command: `python3 ${path}`,
          stdout: res.stdout,
          exitCode: res.exitCode ?? 0,
        });
      },
    };
  }
}
