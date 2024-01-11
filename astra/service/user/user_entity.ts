import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { AuthUserEntity } from "../auth/auth_user_entity";

@Entity({ tableName: "users" })
export class UserEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @ManyToMany(() => AuthUserEntity)
  authUsers = new Collection<AuthUserEntity>(this);

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;
}
