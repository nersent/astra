import {
  Entity,
  Enum,
  Index,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { UserEntity } from "../user/user_entity";

import { MediaEntity } from "./media_entity";

@Entity({ tableName: "media_access" })
export class MediaAccessEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @ManyToOne(() => MediaEntity)
  media!: MediaEntity;

  @ManyToOne(() => UserEntity)
  forUser!: UserEntity;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  constructor(opts?: Partial<MediaAccessEntity>) {
    Object.assign(this, opts);
  }
}
