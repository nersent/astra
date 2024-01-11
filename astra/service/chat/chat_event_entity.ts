import {
  Entity,
  Enum,
  Index,
  PrimaryKey,
  Property,
  ManyToOne,
} from "@mikro-orm/core";

import {
  ChatEvent,
  ChatEventData,
  ChatEventType,
  ChatEvents,
} from "../../common/chat";
import { UserEntity } from "../user/user_entity";

import { ChatEntity } from "./chat_entity";

@Entity({ tableName: "chat_events" })
export class ChatEventEntity<T extends ChatEventType = ChatEventType> {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property({ columnType: "jsonb", nullable: true })
  data?: ChatEvents[T]["data"];

  @Index()
  @Enum(() => ChatEventType)
  type!: T;

  @ManyToOne(() => UserEntity, { nullable: true })
  sender?: UserEntity;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @ManyToOne(() => ChatEntity)
  chat!: ChatEntity;

  constructor(opts: Partial<ChatEventEntity<T>> = {}) {
    Object.assign(this, opts);
    this.createdAt ??= new Date();
  }
}
