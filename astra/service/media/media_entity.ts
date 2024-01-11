import {
  Collection,
  Entity,
  Enum,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { UserEntity } from "../user/user_entity";

export enum MediaType {
  Unknown = 0,
  Image = 1,
}

@Entity({ tableName: "media" })
export class MediaEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property()
  filename!: string;

  @Property()
  originalFilename!: string;

  @Property()
  ext!: string;

  @Index()
  @Enum(() => MediaType)
  type!: MediaType;

  @Property({ nullable: true })
  mimeType?: string;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @Property({ columnType: "text", nullable: true })
  description?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  owner?: typeof UserEntity;

  @Property({ default: false })
  isPublic!: boolean;

  constructor(opts?: Partial<MediaEntity>) {
    Object.assign(this, opts);
  }
}
