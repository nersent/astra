import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";

import { AgentTools } from "../agent/agent_tools";
import { ChatEntity } from "../chat/chat_entity";
import { ChatEventEntity } from "../chat/chat_event_entity";
import { ChatService } from "../chat/chat_service";
import { ConfigService } from "../config_service";
import { MediaService } from "../media/media_service";
import { OPEN_AI_CLIENT } from "../openai_client_provider";
import { SandboxContainerService } from "../sandbox/sandbox_container_service";
import { SandboxService } from "../sandbox/sandbox_service";
import { UserEntity } from "../user/user_entity";

import { AstraChat } from "./astra_chat";

@Injectable()
export class AstraChatService {
  private readonly chatUuidToAstraChat = new Map<string, AstraChat>();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ChatEventEntity)
    private readonly chatEventsRepo: EntityRepository<ChatEventEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatsRepo: EntityRepository<ChatEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: EntityRepository<UserEntity>,
    private readonly sandboxContainerService: SandboxContainerService,
    private readonly sandboxService: SandboxService,
    @Inject(OPEN_AI_CLIENT) private readonly openAiClient: OpenAI,
    private readonly agentTools: AgentTools,
    private readonly chatService: ChatService,
    private readonly mediaService: MediaService,
  ) {}

  private async createChat(chatUuid: string): Promise<AstraChat> {
    const chat = new AstraChat(chatUuid, {
      configService: this.configService,
      chatEventsRepo: this.chatEventsRepo,
      chatsRepo: this.chatsRepo,
      usersRepo: this.usersRepo,
      sandboxContainerService: this.sandboxContainerService,
      sandboxService: this.sandboxService,
      openAiClient: this.openAiClient,
      agentTools: this.agentTools,
      chatService: this.chatService,
      mediaService: this.mediaService,
    });
    await chat.init();
    return chat;
  }

  public async getChat(chatUuid: string): Promise<AstraChat> {
    let chat = this.chatUuidToAstraChat.get(chatUuid);
    if (!chat) {
      chat = await this.createChat(chatUuid);
      this.chatUuidToAstraChat.set(chatUuid, chat);
    }
    return chat;
  }
}
