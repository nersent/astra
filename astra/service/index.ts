import "reflect-metadata";

import { resolve } from "path";

import fastifyCookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { mbToBytes } from "~/common/js/fs";
import { run } from "~/common/nest/lifecycle";
import { createLogger } from "~/common/nest/logger";

import { AgentTools } from "./agent/agent_tools";
import { BrowserTools } from "./agent/tools/browser_tools";
import { SandboxTools } from "./agent/tools/sandbox_tools";
import { TextTools } from "./agent/tools/text_tools";
import { AstraChatService } from "./astra/astra_chat_service";
import { AuthApiController } from "./auth/auth_api_controller";
import { AuthGuard } from "./auth/auth_guard";
import { AuthService } from "./auth/auth_service";
import { AuthUserEntity } from "./auth/auth_user_entity";
import { JwtService } from "./auth/jwt";
import { ChatApiController } from "./chat/chat_api_controller";
import { ChatEntity } from "./chat/chat_entity";
import { ChatEventEntity } from "./chat/chat_event_entity";
import { ChatGuard } from "./chat/chat_guard";
import { ChatService } from "./chat/chat_service";
import { ConfigService, ENV_SCHEMA, getDbConfig } from "./config_service";
import { MediaAccessEntity } from "./media/media_access_entity";
import { MediaApiController } from "./media/media_api_controller";
import { MediaEntity } from "./media/media_entity";
import { MediaService } from "./media/media_service";
import { OPEN_AI_CLIENT, openAiClientProvider } from "./openai_client_provider";
import {
  SandboxContainer,
  SandboxContainerService,
} from "./sandbox/sandbox_container_service";
import { SandboxService } from "./sandbox/sandbox_service";
import { MeApiController } from "./user/me_api_controller";
import { UserEntity } from "./user/user_entity";
import { UserService } from "./user/user_service";

const entities = [
  UserEntity,
  ChatEntity,
  ChatEventEntity,
  MediaEntity,
  MediaAccessEntity,
  AuthUserEntity,
];

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...getDbConfig(),
      entities,
      debug: process.env["NODE_ENV"] === "development",
      forceUtcTimezone: true,
      strict: true,
      allowGlobalContext: true,
      discovery: {
        requireEntitiesArray: true,
      },
    }),
    MikroOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      envFilePath: [resolve(".env.test"), resolve(".env")],
      cache: true,
      validationSchema: ENV_SCHEMA,
    }),
  ],
  controllers: [
    AuthApiController,
    MediaApiController,
    ChatApiController,
    MeApiController,
  ],
  providers: [
    ConfigService,
    openAiClientProvider,
    UserService,
    MediaService,
    AuthService,
    AuthGuard,
    ChatGuard,
    ChatService,
    JwtService,
    SandboxContainerService,
    SandboxService,
    TextTools,
    AgentTools,
    SandboxTools,
    BrowserTools,
    AstraChatService,
  ],
})
class AppModule {}

run(async (): Promise<void> => {
  const adapter = new FastifyAdapter({ bodyLimit: mbToBytes(256) });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      rawBody: true,
      logger: createLogger({
        path: resolve(process.env["OUT_PATH"] ?? "", "astra_service.log"),
      }),
    },
  );

  const config = app.get(ConfigService);

  await app.register(fastifyCookie, {
    secret: config.cookieSecret,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.register(multipart as any, {});
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const orm = app.get(MikroORM);
  const sandboxContainerService = app.get(SandboxContainerService);
  const sandboxService = app.get(SandboxService);
  // await sandboxContainerService.stopAll();
  // await sandboxContainerService.removeAll();

  await app.listen(config.port, "0.0.0.0", (err, address) => {
    if (err) throw err;
    console.log(`Listening on ${address}`);
  });
});
