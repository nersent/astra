import * as chalk from "chalk";
import { Client, ClientChannel } from "ssh2";

import { stripAnsi } from "../js/ansi";
import { tryParseInt } from "../js/number";
import { randomStringAsync } from "../node/random";

import { EventEmitter } from "~/common/js/event_emitter";
import { EventRegistry } from "~/common/js/event_registry";

export interface SshClientConfig {}

export const DEFAULT_SSH_CLIENT_CONFIG: Partial<{}> = {};

export interface SshClientConnectOptions {
  host: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface SshClientEvent {
  client: SshClient;
}

export type SshClientEvents = {};

export type SshClientExecRequest = SshClientExecOptions | string;

export interface SshClientExecOptions {
  command: string;
  args?: string[];
  env?: Record<string, any>;
  interactive?: boolean;
  escape?: boolean;
}

export interface SshClientExecResult {
  stdout: string;
  exitCode?: number;
  signal?: string;
  command?: string;
}

export class SshClient extends EventRegistry<SshClientEvents> {
  protected readonly eventEmitter = new EventEmitter<SshClientEvents>(this);

  public readonly config: SshClientConfig;

  public client: Client | undefined;

  public clientChannel: ClientChannel | undefined;

  constructor(config: SshClientConfig) {
    super();
    this.config = {
      ...DEFAULT_SSH_CLIENT_CONFIG,
      ...config,
    };
  }

  public async connect(options: SshClientConnectOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const client = new Client();

      client.once("ready", (err) => {
        if (err) return reject(err);

        this.client = client;

        client.shell((err, stream) => {
          if (err) return reject(err);

          this.client = client;
          this.clientChannel = stream;

          resolve();
        });
      });

      client.connect({
        host: options.host,
        port: options.port || 22,
        username: options.username ?? "root",
        password: options.password ?? "",
      });
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.clientChannel?.end();
      this.client?.end();
      this.client = undefined;
      this.clientChannel = undefined;
      resolve();
    });
  }

  public get isConnected(): boolean {
    return this.client != null && this.clientChannel != null;
  }

  protected assertConnected(): asserts this is {
    client: Client;
    clientChannel: ClientChannel;
  } {
    if (!this.isConnected) {
      throw new Error("SSH client is not connected");
    }
  }

  public execRaw(command: string): Promise<string> {
    this.assertConnected();

    return new Promise<string>((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) return reject(err);
        let stdoutBuffer = "";

        stream
          .on("data", (data: any) => {
            stdoutBuffer += data;
          })
          .stderr.on("data", (data) => {
            stdoutBuffer += data;
          });

        stream.on("close", (code: any, signal: any) => {
          resolve(stdoutBuffer);
        });
      });
    });
  }

  public execRawShell(
    command: string,
    escape?: boolean,
  ): Promise<{ stdout: string; exitCode?: number; command?: string }> {
    this.assertConnected();

    return new Promise<{ stdout: string; exitCode?: number; command?: string }>(
      async (resolve, reject) => {
        const [startUuid, endUuid, exitCodeUuid] = await Promise.all([
          randomStringAsync(32),
          randomStringAsync(32),
          randomStringAsync(32),
        ]);
        const encodedStartUuid = Buffer.from(startUuid).toString("base64");
        const encodedEndUuid = Buffer.from(endUuid).toString("base64");

        let _command = command;
        if (escape) {
          _command = `(${_command}) | base64`;
        }

        console.log(_command);

        const commandBase64 = Buffer.from(_command).toString("base64");
        const bashDecodeStartUuid = `echo '${encodedStartUuid}' | base64 --decode`;
        const bashDecodeEndUuid = `echo '${encodedEndUuid}' | base64 --decode`;
        const bashDecodeCommand = `echo '${commandBase64}' | base64 --decode`;
        const scriptCommand = `
echo $(${bashDecodeStartUuid})
eval $(${bashDecodeCommand})
echo '${exitCodeUuid}'$?
echo $(${bashDecodeEndUuid})`
          .trim()
          .split("\n")
          .map((r) => r.trim())
          .join(";");

        // console.log(scriptCommand);

        this.clientChannel.write(`${scriptCommand.trim()}\n`, (err) => {
          if (err) return reject(err);
          let stdout = "";

          const onData = (data: Buffer): void => {
            stdout += stripAnsi(data.toString());

            const startFirstIdx = stdout.indexOf(startUuid);
            const endFirstIdx = stdout.indexOf(endUuid);
            const exitCodeLastIdx = stdout.lastIndexOf(exitCodeUuid);

            if (
              startFirstIdx === -1 ||
              endFirstIdx === -1 ||
              exitCodeLastIdx === -1
            ) {
              return;
            }

            // console.log(chalk.blackBright(stdout));

            const exitCodeStr = stdout.slice(
              exitCodeLastIdx + exitCodeUuid.length,
              endFirstIdx,
            );
            const exitCode = tryParseInt(exitCodeStr);
            let res = stdout.slice(
              startFirstIdx + startUuid.length,
              exitCodeLastIdx,
            );
            const firstNewLineIdx = res.indexOf("\n");
            if (firstNewLineIdx !== -1) {
              res = res.slice(firstNewLineIdx + 1);
            }
            const lastNewLineIdx = res.lastIndexOf("\n");
            if (lastNewLineIdx !== -1) {
              res = res.slice(0, lastNewLineIdx);
            }
            const lastCarriageReturnIdx = res.lastIndexOf("\r");
            if (lastCarriageReturnIdx !== -1) {
              res = res.slice(0, lastCarriageReturnIdx);
            }
            // console.log(chalk.redBright(res));
            // console.log(chalk.green(exitCode), exitCodeStr);

            // const lastNewLineIndex = out.lastIndexOf("\n");
            // if (lastNewLineIndex !== -1) {
            //   out = out.slice(0, lastNewLineIndex);
            // }
            // const exitCodeStr = stdout
            //   .slice(endFirstIdx + endUuid.length, endLastIdx)
            //   .trim();
            // const exitCode = tryParseInt(exitCodeStr);

            // // console.log(chalk.blackBright(startUuid, endUuid));

            // // console.log(chalk.redBright(stdout));

            if (escape && (exitCode == null || exitCode === 0)) {
              res = Buffer.from(res.trim(), "base64").toString();
            }

            this.clientChannel.removeListener("data", onData);
            resolve({ stdout: res, exitCode, command: command.trim() });
          };

          this.clientChannel.addListener("data", onData);
        });

        // const startEcho = `echo ${startUuid}`;
        // const endEcho = `echo $? ${endUuid}`;

        // console.log(command, commandBase64);

        // this.clientChannel.write(
        //   `${startEcho}\n${command}\n\n${endEcho}\n`,
        //   (err) => {
        //     if (err) return reject(err);
        //     let stdoutBuffer = "";
        //     let exitCode: number | undefined;

        //     const onData = (data: Buffer): void => {
        //       stdoutBuffer += stripAnsi(data.toString());

        //       const startFirstIdx = stdoutBuffer.indexOf(startUuid);
        //       const startLastIdx = stdoutBuffer.lastIndexOf(startUuid);
        //       const endFirstIdx = stdoutBuffer.indexOf(endUuid);
        //       const endLastIdx = stdoutBuffer.lastIndexOf(endUuid);
        //       if (
        //         startFirstIdx !== -1 &&
        //         startLastIdx !== -1 &&
        //         endFirstIdx !== -1 &&
        //         endLastIdx !== -1 &&
        //         startLastIdx > startFirstIdx &&
        //         endLastIdx > endFirstIdx
        //       ) {
        //         // let res = stdoutBuffer.slice(startFirstIdx, endLastIdx);
        //         // res = res.slice(res.lastIndexOf(startUuid) + startUuid.length);
        //         // res = res.trimStart();
        //         // let lines = res.split("\n");
        //         // let endLineIdx = lines.length - 1;
        //         // while (endLineIdx >= 0) {
        //         //   if (lines[endLineIdx].includes(endUuid)) {
        //         //     break;
        //         //   }
        //         //   endLineIdx--;
        //         // }
        //         // lines = lines.slice(0, endLineIdx);
        //         // if (lines[lines.length - 2]?.includes("echo $?")) {
        //         //   const rawExitCode = lines[lines.length - 1].trim();
        //         //   exitCode = tryParseInt(rawExitCode);
        //         //   lines = lines.slice(0, lines.length - 2);
        //         // }

        //         // res = lines.join("\n");
        //         let res = stdoutBuffer
        //           .slice(startLastIdx + startUuid.length, endFirstIdx)
        //           .trim();
        //         res = res + "";
        //         console.log(res);
        //         // const firstNewLineIndex = res.indexOf("\n");
        //         // const command = res.slice(0, firstNewLineIndex).trim();
        //         // res = res.slice(firstNewLineIndex).trim();
        //         // let resLines = res.split("\n");
        //         // const exitCodeCommandLineIndex = resLines.findLastIndex(
        //         //   (line) => line.trimEnd().endsWith("echo $?"),
        //         // );
        //         // const exitCode = tryParseInt(
        //         //   resLines[exitCodeCommandLineIndex + 1]?.trim(),
        //         // );
        //         // resLines = resLines.slice(0, exitCodeCommandLineIndex);
        //         // res = resLines.join("\n");
        //         this.clientChannel.removeListener("data", onData);
        //         console.log(chalk.blackBright(res));
        //         resolve({ stdout: res, exitCode, command });
        //       }
        //     };

        //     this.clientChannel.addListener("data", onData);
        //   },
        // );
      },
    );
  }

  public async exec(
    options: SshClientExecRequest,
  ): Promise<SshClientExecResult> {
    this.assertConnected();

    if (typeof options === "string") {
      const [name, ...args] = options.split(" ");
      options = {
        command: name,
        args,
      };
    }

    // if (options.interactive) {
    //   options.escape ??= true;
    // }

    let command: string;
    command = options.command;
    const args = options.args ?? [];

    if (options.escape && !options.interactive) {
      command = `"${command}"`;
    }

    let rawCommand = "";

    // if (options.shell) {
    //   rawCommand += `${options.shell} `;
    // }

    rawCommand += `${command} ${args.join(" ")}`;
    const _rawCommand = rawCommand;

    if (options.env != null && Object.keys(options.env).length > 0) {
      const envStr = Object.entries(options.env)
        .map(([key, value]) => `${key}=${value}`)
        .join(" ");

      rawCommand = `${envStr} ${rawCommand}`;
    }

    if (!options.interactive) {
      return new Promise<SshClientExecResult>((resolve, reject) => {
        this.client.exec(rawCommand, (err, stream) => {
          if (err) return reject(err);
          let stdoutBuffer = "";

          stream
            .on("data", (data: any) => {
              stdoutBuffer += data;
            })
            .stderr.on("data", (data) => {
              stdoutBuffer += data;
            });

          stream.on("close", (code: any, signal: any) => {
            resolve({
              stdout: stdoutBuffer,
              exitCode: code,
              signal,
              command: _rawCommand,
            });
          });
        });
      });
    }

    const res = await this.execRawShell(rawCommand, options.escape);
    return res;
  }
}
