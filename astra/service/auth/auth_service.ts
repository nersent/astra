import { daysToMs, yearsToMs } from "@common/js";
import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository, InjectEntityManager } from "@mikro-orm/nestjs";
import { BadRequestException } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuid } from "uuid";
import { JwtToken } from "~/astra/common/auth";
import { compareEncrypted, encryptString } from "~/common/node/bcrypt";

import { ConfigService } from "../config_service";
import { UserEntity } from "../user/user_entity";
import { UserService } from "../user/user_service";

import {
  EmailAlreadyExists,
  InvalidCredentialsException,
} from "./auth_exceptions";
import { AuthProviderType, AuthUserEntity } from "./auth_user_entity";
import { getTokenFromRequest, removeTokenFromRequest } from "./auth_utils";
import { JwtService } from "./jwt";

export interface JwtTokenPayload {
  authId: string;
  tokenUuid: string;
}

export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly userService: UserService,
    @InjectRepository(AuthUserEntity)
    private readonly authUsersRepo: EntityRepository<AuthUserEntity>,
  ) {}

  public async register({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ authUser: AuthUserEntity; user: UserEntity }> {
    email = email.toLowerCase().trim();
    let authUser = await this.authUsersRepo.findOne({ email });
    if (authUser != null) throw new EmailAlreadyExists();

    const encryptedPassword = await encryptString(
      password,
      this.configService.hashingRounds,
    );

    authUser = new AuthUserEntity();
    authUser.email = email;
    authUser.password = encryptedPassword;
    authUser.provider = AuthProviderType.EMAIL;

    const user = await this.userService.createNewProfile(authUser);
    user.authUsers.add(authUser);

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([authUser, user]);
    });

    return { authUser, user };
  }

  private async createTokenForUser(
    authUserEntity: AuthUserEntity,
  ): Promise<JwtToken> {
    const payload: JwtTokenPayload = {
      authId: authUserEntity.uuid,
      tokenUuid: uuid(),
    };
    const token = await this.jwtService.createToken(payload);
    const jwt: JwtToken = {
      expiresIn: this.configService.jwtExpirationTime,
      token: token,
    };
    return jwt;
  }

  public async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<JwtToken> {
    const authUser = await this.authUsersRepo.findOne({ email });
    if (authUser == null) throw new InvalidCredentialsException();
    const isPasswordValid = await compareEncrypted(password, authUser.password);
    if (!isPasswordValid) throw new InvalidCredentialsException();
    const tokenData = await this.createTokenForUser(authUser);
    return tokenData;
  }

  public async decodeToken(token: string): Promise<JwtTokenPayload> {
    const res = await this.jwtService.decodeToken<JwtTokenPayload>(token);
    return res.payload;
  }

  public async validateToken(payload: JwtTokenPayload): Promise<boolean> {
    // const isBlacklisted = await this.jwtBlackList.isBlacklisted(payload.jti);

    // if (isBlacklisted) {
    //   throw new AuthInvalidTokenException();
    // }
    return true;
  }

  public async getDataFromJwtPayload(
    payload: JwtTokenPayload,
  ): Promise<{ user: UserEntity } | undefined> {
    const authId = payload.authId;
    const user = await this.userService.findUserByAuthId(authId);
    if (user == null) return undefined;
    return { user };
  }

  public async tryHandleJwtReq(
    req: FastifyRequest,
  ): Promise<UserEntity | undefined> {
    const token = getTokenFromRequest(req);
    if (token == null) return undefined;

    const decoded = await this.decodeToken(token);
    await this.validateToken(decoded);
    const res = await this.getDataFromJwtPayload(decoded);
    return res?.user;
  }

  public async logout(req: FastifyRequest, res: FastifyReply): Promise<void> {
    removeTokenFromRequest(req, res);
  }
}
