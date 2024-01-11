import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { GetMeRequest, GetMeResponse } from "~/astra/common/user_api";

import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";

import { UserEntity } from "./user_entity";
import { UserService } from "./user_service";

@Controller("me")
export class MeApiController {
  constructor(private readonly userService: UserService) {}

  @Get("/")
  @UseGuards(AuthGuard)
  public async getMe(
    @Query() body: GetMeRequest,
    @SessionUser() user: UserEntity,
    @Req() req: FastifyRequest,
  ): Promise<GetMeResponse> {
    return this.userService.asApiMe(user);
  }
}
