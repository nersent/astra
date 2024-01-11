import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository, InjectEntityManager } from "@mikro-orm/nestjs";
import { User as ApiUser, Me as ApiMe } from "~/astra/common/user";

import { randomString } from "../../../common/js/random";
import { AuthUserEntity } from "../auth/auth_user_entity";
import { ConfigService } from "../config_service";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";

export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    @InjectRepository(UserEntity)
    private readonly usersRepo: EntityRepository<UserEntity>,
    private readonly em: EntityManager,
  ) {}

  public async createNewProfile(authUser: AuthUserEntity): Promise<UserEntity> {
    const user = new UserEntity();
    return user;
  }

  public async findUserByAuthId(
    authId: string,
  ): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOne({ authUsers: { uuid: authId } });
    return user || undefined;
  }

  public async asApiUser(user: UserEntity): Promise<ApiUser> {
    const data: ApiUser = {
      uuid: user.uuid,
    };
    return data;
  }

  public async asApiMe(user: UserEntity): Promise<ApiMe> {
    const base = await this.asApiUser(user);
    return {
      ...base,
    };
  }

  public async findUserByUuid(uuid: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOne({ uuid });
    return user as UserEntity | undefined;
  }
}
