import {
  Entity,
  Enum,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

export enum AuthProviderType {
  EMAIL = 0,
}

@Entity({ tableName: "auth_users" })
export class AuthUserEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Index()
  @Enum(() => AuthProviderType)
  provider!: number;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;
}
