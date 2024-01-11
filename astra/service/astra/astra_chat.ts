import { copyFile } from "fs/promises";
import { resolve } from "path";

import { EntityRepository } from "@mikro-orm/core";
import * as chalk from "chalk";
import OpenAI from "openai";
import { ChatEventType } from "~/astra/common/chat";
import { assertValue } from "~/common/js/assert";
import { createLoggerFromConsole } from "~/common/js/logger";
import { ensureDir, exists } from "~/common/node/fs";
import { SshClient } from "~/common/node/ssh_client";

import { AgentTool } from "../agent/agent_tool";
import { AgentTools } from "../agent/agent_tools";
import { ChatEntity } from "../chat/chat_entity";
import { ChatEventEntity } from "../chat/chat_event_entity";
import { ChatEvent, ChatService } from "../chat/chat_service";
import { ConfigService } from "../config_service";
import { GptModel } from "../llm/gpt_model";
import { Llm, LlmMessage } from "../llm/llm";
import { MediaService } from "../media/media_service";
import { Sandbox } from "../sandbox/sandbox";
import {
  SandboxContainer,
  SandboxContainerService,
} from "../sandbox/sandbox_container_service";
import { SandboxService } from "../sandbox/sandbox_service";
import { UserEntity } from "../user/user_entity";

import {
  AstraAgent,
  AstraAgentJobEvent,
  AstraAgentTaskEvent,
} from "./astra_agent";

export interface AstraChatDeps {
  configService: ConfigService;
  chatEventsRepo: EntityRepository<ChatEventEntity>;
  chatsRepo: EntityRepository<ChatEntity>;
  usersRepo: EntityRepository<UserEntity>;
  sandboxContainerService: SandboxContainerService;
  sandboxService: SandboxService;
  openAiClient: OpenAI;
  agentTools: AgentTools;
  chatService: ChatService;
  mediaService: MediaService;
}

export class AstraChat {
  public isInitialized = false;
  public agent!: AstraAgent;
  public sandbox!: Sandbox;
  public path!: string;
  public agentPath!: string;
  public sandboxPath!: string;
  public sandboxContainer!: SandboxContainer;
  public sshClient!: SshClient;
  public llm!: Llm;
  public isActive = false;
  public isRunning = false;

  constructor(
    public readonly chatUuid: string,
    private readonly deps: AstraChatDeps,
  ) {}

  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.path = resolve(this.deps.configService.chatsDir, this.chatUuid);
    this.sandboxPath = resolve(this.path, "sandbox");
    this.agentPath = resolve(this.path, "agent");
    await ensureDir(this.path, this.sandboxPath, this.agentPath);

    const sandboxOptions = await this.deps.sandboxService.createOptions();
    this.sandboxContainer = await this.deps.sandboxService.createContainer({
      sandboxId: this.chatUuid,
      options: sandboxOptions,
      path: this.sandboxPath,
    });
    this.sshClient = await this.deps.sandboxService.createSshClient(
      sandboxOptions.ssh,
    );
    this.sandbox = await this.deps.sandboxService.createSandboxFromSsh(
      {
        id: this.chatUuid,
        sshClient: this.sshClient,
        logger: createLoggerFromConsole(),
      },
      sandboxOptions,
    );
    await this.sandbox.cd("/mnt/data");
    await this.sandbox.exec(`alias sudo='true'`);

    this.llm = new GptModel("gpt-3.5-turbo-1106", this.deps.openAiClient);

    assertValue(this.sandbox);
    assertValue(this.llm);

    this.agent = new AstraAgent(
      { taskMaxIters: 20, mainAgentTools: this.getMainAgentTools() },
      this.sandbox,
      this.deps.agentTools,
      createLoggerFromConsole(),
      this.llm,
    );
    await this.agent.load(this.agentPath);

    this.agent.on("task", this.onAgentTask);
    this.agent.on("job", this.onAgentJob);

    this.isInitialized = true;
  }

  private getMainAgentTools(): AgentTool[] {
    return [
      {
        id: "send_file",
        description: `
Sends file from file system to user.
`.trim(),
        arguments: {
          path: {
            type: "string",
            description: "Absolute path to file. Example: /mnt/data/file.txt",
            required: true,
          },
          description: {
            type: "string",
            required: true,
          },
        },
        impl: async (ctx): Promise<void> => {
          const { description } = ctx.args;
          let path = ((ctx.args["path"] as string) ?? "").trim();
          const isRemote =
            path.startsWith("http://") || path.startsWith("https://");
          if (isRemote) {
            throw new Error(
              "Http is not supported. Only local files are supported.\nHint: use `delegate` tool.",
            );
          }
          if (path.startsWith("sandbox://")) {
            path = path.split("sandbox:/")[1];
          } else if (path.startsWith("sandbox:/")) {
            path = path.split("sandbox:")[1];
          }

          if (!(await this.sandbox.exists(path))) {
            throw new Error(`Path ${path} does not exist.`);
          }
          if (await this.sandbox.isDirectory(path)) {
            throw new Error(
              `Path ${path} is a directory. Only files are supported.`,
            );
          }
          if (path.startsWith("/")) {
            path = path.slice(1);
          }
          const localPath = resolve(this.sandboxPath, path);

          await this.onFile({
            sandboxPath: path,
            localPath,
            description,
          });

          ctx.out.text(`User received file ${path}`);
        },
      },
    ];
  }

  private async onFile(e: {
    sandboxPath: string;
    localPath: string;
    description: string;
  }): Promise<void> {
    this.agent.logger.log(
      chalk.yellowBright(`File: ${e.localPath} | ${e.sandboxPath}`),
    );
    const chat = await this.chat;
    const media = await this.deps.mediaService.createMedia({
      path: e.localPath,
      owner: chat.participant,
    });
    await this.deps.chatService.handleEvent(
      new ChatEventEntity({
        chat,
        type: ChatEventType.Media,
        data: media.uuid,
      }),
    );
  }

  public get chat(): Promise<ChatEntity> {
    return this.deps.chatsRepo.findOneOrFail({ uuid: this.chatUuid });
  }

  public assertNotRunning(): asserts this is { isRunning: false } {
    if (this.isRunning) {
      throw new Error("Agent is running");
    }
  }

  private onAgentTask = async (e: AstraAgentTaskEvent): Promise<void> => {
    const chat = await this.chat;
    await this.deps.chatService.sendTask(chat, e.task);
  };

  private onAgentJob = async (e: AstraAgentJobEvent): Promise<void> => {
    const chat = await this.chat;
    await this.deps.chatService.sendJob(chat, e.job);
  };

  private async updateContext(): Promise<void> {
    await this.chat;
    const messages = this.agent.mainAgent.state.ctx.messages;

    let time: Date | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "user" && message["$createdAt"] != null) {
        time = new Date(message["$createdAt"]);
        break;
      }
    }

    const eventsSince = await this.deps.chatEventsRepo.find(
      {
        chat: this.chatUuid,
        sender: { $ne: null },
        ...(time == null ? ({} as any) : { createdAt: { $gt: time } }),
      },
      {
        orderBy: { createdAt: "ASC" },
      },
    );

    for (const event of eventsSince) {
      let message: LlmMessage | undefined;

      if (event.type === ChatEventType.Text) {
        message = {
          role: "user",
          content: event.data,
        };
      } else if (event.type === ChatEventType.Media) {
        const mediaEntity = await this.deps.mediaService.getMediaByUuid(
          event.data as string,
        );
        const mediaPath = this.deps.mediaService.getMediaPath(mediaEntity);

        const uploadsPath = resolve(this.sandboxPath, "mnt/data/uploads");
        const filePath = resolve(uploadsPath, mediaEntity.originalFilename);
        const sandboxPath = `/mnt/data/uploads/${mediaEntity.originalFilename}`;
        await ensureDir(uploadsPath);
        await copyFile(mediaPath, filePath);

        message = {
          role: "user",
          content: JSON.stringify(
            {
              type: "file",
              path: sandboxPath,
              mimeType: mediaEntity.mimeType,
            },
            null,
            2,
          ),
        };
      }

      if (message != null) {
        message["$createdAt"] = event.createdAt.getTime();
        messages.push(message);
      }
    }

    this.agent.mainAgent.state.ctx.messages = messages;
  }

  public async next(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;
    await this.updateContext();
    this.isRunning = true;

    while (true) {
      const { messages } = await this.agent.next();
      const promptUser =
        this.agent.mainAgent.state.ctx.messages.length === 0 ||
        (messages.length > 0 &&
          !messages.some((r) => r.role === "assistant" && r.toolCalls != null));

      for (const message of messages) {
        if (
          message.role === "assistant" &&
          message.content != null &&
          message.content.trim().length > 0
        ) {
          await this.deps.chatService.handleEvent(
            new ChatEventEntity({
              chat: await this.chat,
              type: ChatEventType.Markdown,
              data: message.content,
            }),
          );
        }
      }

      if (promptUser) break;
    }

    this.isRunning = false;
    await this.agent.save(this.agentPath);
    this.isActive = false;

    const chat = await this.chat;
    await this.deps.chatService.sendTask(chat, undefined);
    await this.deps.chatService.sendActiveStatus(chat, false);
  }
}
