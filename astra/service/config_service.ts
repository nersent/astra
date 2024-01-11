import { resolve } from "path";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";
import { config } from "dotenv";
import * as Joi from "joi";
import { ensureDir } from "~/common/node/fs";

export const ENV_SCHEMA = Joi.object({
  API_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  OUT_PATH: Joi.string().required(),
  OPENAI_ACCESS_TOKEN: Joi.string().required(),
  UI_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
  ADMIN_SECRET: Joi.string().required(),
  GOOGLE_SEARCH_API_TOKEN: Joi.string().required(),
  GOOGLE_SEARCH_API_CX: Joi.string().required(),
  BING_SEARCH_API_TOKEN: Joi.string().required(),
});

export const getDbConfig = (): Record<string, any> => {
  return {
    type: "postgresql",
    host: process.env["POSTGRES_HOST"] as string,
    port: parseInt(process.env["POSTGRES_PORT"] as string),
    dbName: process.env["POSTGRES_DB"] as string,
    user: process.env["POSTGRES_USER"] as string,
    password: process.env["POSTGRES_PASSWORD"] as string,
  };
};

@Injectable()
export class ConfigService implements OnModuleInit {
  constructor(private readonly env: NestConfigService) {
    config();
  }

  public async onModuleInit(): Promise<void> {
    await ensureDir(this.outPath, this.mediaPath, this.chatsDir);
  }

  public get port(): number {
    return this.env.getOrThrow("PORT", { infer: true });
  }

  public get apiUrl(): string {
    return this.env.get("API_URL") as string;
  }

  public get outPath(): string {
    return resolve(this.env.get("OUT_PATH") as string);
  }

  public get openAiAccessToken(): string {
    return this.env.get("OPENAI_ACCESS_TOKEN") as string;
  }

  public get hashingRounds(): number {
    return 10;
  }

  public get jwtSecret(): string {
    return this.env.getOrThrow("JWT_SECRET");
  }

  public get jwtExpirationTime(): number {
    return 60 * 60 * 24 * 365; // 7 days
  }

  public get cookieSecret(): string {
    return this.env.getOrThrow("COOKIE_SECRET");
  }

  public get adminSecret(): string {
    return this.env.getOrThrow("ADMIN_SECRET");
  }

  public get uiUrl(): string {
    return this.env.getOrThrow("UI_URL");
  }

  public get googleSearchApiToken(): string {
    return this.env.getOrThrow("GOOGLE_SEARCH_API_TOKEN");
  }

  public get googleSearchApiCx(): string {
    return this.env.getOrThrow("GOOGLE_SEARCH_API_CX");
  }

  public get bingSearchApiToken(): string {
    return this.env.getOrThrow("BING_SEARCH_API_TOKEN");
  }

  public get mediaPath(): string {
    return resolve(this.outPath, "media");
  }

  public get sandboxImage(): string {
    return `astra_sandbox`;
  }

  public get chatsDir(): string {
    return resolve(this.outPath, "chat");
  }
}
