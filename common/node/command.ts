import { exec as nodeExec } from "child_process";

export interface ExecOptions {
  command: string;
  args?: any[];
  env?: Record<string, any>;
  cwd?: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  signal?: string;
  exitCode: number;
}

export const flattenCommand = (command: string, args: any[] = []): string => {
  if (args.length === 0) return command;
  return `${command} ${args.join(" ")}`;
};

export const exec = (options: ExecOptions | string): Promise<ExecResult> => {
  const commandStr =
    typeof options === "string"
      ? options
      : `${options.command} ${options.args?.join(" ") ?? ""}`;
  return new Promise<ExecResult>((resolve) => {
    nodeExec(
      commandStr,
      {
        env: typeof options === "string" ? {} : (options.env as any),
        cwd: typeof options === "string" ? undefined : options.cwd,
      },
      (error, stdout, stderr) => {
        resolve({
          stdout,
          stderr,
          signal: error?.signal,
          exitCode: error?.code ?? 0,
        });
      },
    );
  });
};
