import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

import { UserEntity } from "../user/user_entity";

@Entity({ tableName: "chats" })
export class ChatEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property({ nullable: true })
  title?: string;

  @ManyToOne(() => UserEntity)
  participant!: UserEntity;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  lastActivityAt!: Date;

  constructor(opts: Partial<ChatEntity> = {}) {
    Object.assign(this, opts);
  }
}
