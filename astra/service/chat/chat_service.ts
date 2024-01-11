import { EntityRepository, MikroORM, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable } from "rxjs";
import {
  Chat as ApiChat,
  ChatEvent as ApiChatEvent,
  ChatDiffEvent,
  ChatEventType,
} from "~/astra/common/chat";
import { ChatEventsSseResponse } from "~/astra/common/chat_api";
import { asArray } from "~/common/js/array";
import { randomUuid } from "~/common/node/random";

import { EventEmitter } from "../../../common/js/event_emitter";
import { EventRegistry } from "../../../common/js/event_registry";
import { ConfigService } from "../config_service";
import { MediaEntity } from "../media/media_entity";
import { UserEntity } from "../user/user_entity";

import { ChatEntity } from "./chat_entity";
import { ChatEventEntity } from "./chat_event_entity";

export interface ChatEvent {
  eventEntity: ChatEventEntity;
  deviceId?: string;
}

export type ChatEvents = {
  event: (e: ChatEvent) => Promise<void> | void;
};

@Injectable()
export class ChatService extends EventRegistry<ChatEvents> {
  private readonly emitter = new EventEmitter<ChatEvents>(this);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ChatEventEntity)
    private readonly chatEventsRepo: EntityRepository<ChatEventEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatsRepo: EntityRepository<ChatEntity>,
    @InjectRepository(UserEntity)
    private readonly users: EntityRepository<UserEntity>,
    private readonly em: EntityManager,
    private readonly orm: MikroORM<PostgreSqlDriver>,
  ) {
    super();
  }

  public async getChatsForUser(participant: UserEntity): Promise<ChatEntity[]> {
    const chats = await this.chatsRepo.find(
      { participant },
      { orderBy: { lastActivityAt: "DESC" } },
    );
    return chats;
  }

  public async createChatForUser(participant: UserEntity): Promise<ChatEntity> {
    const chat = new ChatEntity({ participant });
    await this.em.persistAndFlush(chat);
    return chat;
  }

  public async getEvents(
    chat: ChatEntity,
  ): Promise<{ events: ChatEventEntity[] }> {
    const events = await this.chatEventsRepo.find(
      { chat },
      { orderBy: { createdAt: "DESC" } },
    );
    return { events };
  }

  public async asApiChatEvent<T = ApiChatEvent>(
    entity: ChatEventEntity,
  ): Promise<T> {
    const data = entity.data;
    const res = {
      uuid: entity.uuid,
      data,
      type: entity.type,
      chatUuid: entity.chat.uuid,
      createdAt: entity.createdAt.getTime(),
    } as any;
    if (entity.sender != null) {
      (res as any)["senderUuid"] = entity.sender.uuid;
    }
    return res as T;
  }

  public async asApiChat(chat: ChatEntity): Promise<ApiChat> {
    return {
      uuid: chat.uuid,
      lastActivityAt: chat.lastActivityAt.getTime(),
      title: chat.title,
      participant: chat.participant.uuid,
    };
  }

  public async findChatByUuid(uuid: string): Promise<ChatEntity | undefined> {
    return (await this.chatsRepo.findOne({ uuid })) as ChatEntity | undefined;
  }

  public async canUserAccessChat(
    chat: ChatEntity,
    user: UserEntity,
  ): Promise<boolean> {
    return chat.participant.uuid === user.uuid;
  }

  public async handleEvent<T extends ChatEventType>(
    e: ChatEventEntity<T> | ChatEventEntity<T>[],
    deviceId?: string,
  ): Promise<ChatEventEntity<T>[]> {
    const events = asArray(e);

    for (const e of events) {
      if (e.chat == null) throw new Error("Thread is not persisted");
      e.chat.lastActivityAt = new Date();
    }

    await this.em.persistAndFlush(events);

    for (const e of events) {
      this.emitter.emit("event", { eventEntity: e, deviceId });
    }

    return events;
  }

  public createChatEventsSse(chat: ChatEntity): Observable<MessageEvent> {
    const chatUuid = chat.uuid;
    return new Observable<MessageEvent>((subscriber) => {
      this.on("event", async ({ eventEntity: e, deviceId }) => {
        if (e.chat.uuid !== chatUuid) return;
        subscriber.next({
          data: {
            deviceId,
            events: [await this.asApiChatEvent(e)],
          } as ChatEventsSseResponse,
        });
      });
    });
  }

  public async handleUpdatedEvent(
    eventEntity: ChatEventEntity,
  ): Promise<ChatEventEntity> {
    await this.em.persistAndFlush(eventEntity);
    this.emitter.emit("event", { eventEntity });
    return eventEntity;
  }

  public async sendActiveStatus(
    chat: ChatEntity,
    isActive: boolean = true,
  ): Promise<void> {
    const e = new ChatEventEntity({
      chat,
      type: ChatEventType.Active,
      data: isActive,
      uuid: randomUuid(),
    });
    this.emitter.emit("event", { eventEntity: e });
  }

  public async sendTask(chat: ChatEntity, description?: string): Promise<void> {
    const e = new ChatEventEntity({
      chat,
      type: ChatEventType.Task,
      data: {
        description,
      },
      uuid: randomUuid(),
    });
    this.emitter.emit("event", { eventEntity: e });
  }

  public async sendJob(chat: ChatEntity, description?: string): Promise<void> {
    const e = new ChatEventEntity({
      chat,
      type: ChatEventType.Job,
      data: {
        description,
      },
      uuid: randomUuid(),
    });
    this.emitter.emit("event", { eventEntity: e });
  }
}
