import {
  Controller,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Param,
  Response,
  Req,
  Res,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
} from "~/astra/common/auth_api";

import { ConfigService } from "../config_service";

import { AuthService } from "./auth_service";

@Controller("auth")
export class AuthApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  public async login(
    @Body() body: AuthLoginRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthLoginResponse> {
    const token = await this.authService.login(body);
    res.setCookie("sessionToken", token.token, {
      path: "/",
      maxAge: token.expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return { token };
  }

  @Post("register")
  public async register(
    @Body() body: AuthRegisterRequest,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthRegisterResponse> {
    await this.authService.register({ ...body });
    const token = await this.authService.login(body);
    res.setCookie("sessionToken", token.token, {
      httpOnly: true,
      path: "/",
      maxAge: token.expiresIn,
    });
    return { token };
  }

  @Get("logout")
  public async logout(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<void> {
    await this.authService.logout(req, res);
    return res.status(HttpStatus.OK).send();
  }
}
