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
  Sse,
  Response,
  MessageEvent,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { ChatEventType, ChatTextEvent } from "~/astra/common/chat";
import {
  ChatEventsSseRequest,
  CreateChatRequest,
  CreateChatResponse,
  GetChatEventsRequest,
  GetChatEventsResponse,
  GetChatsRequest,
  GetChatsResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "~/astra/common/chat_api";
import { FileInterceptor } from "~/common/nest/multipart/file_interceptor";
import { MemoryStorageFile } from "~/common/nest/multipart/memory_storage";
import { UploadedFile } from "~/common/nest/multipart/uploaded_file_decorator";

import { AstraChatService } from "../astra/astra_chat_service";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";

import { Chat } from "./chat_decorators";
import { ChatEntity } from "./chat_entity";
import { ChatEventEntity } from "./chat_event_entity";
import { ChatGuard } from "./chat_guard";
import { ChatService } from "./chat_service";

@Controller("")
export class ChatApiController {
  constructor(
    private readonly chatService: ChatService,
    private readonly astraChatService: AstraChatService,
    private readonly mediaService: MediaService,
  ) {}

  @Get("/chats")
  @UseGuards(AuthGuard)
  public async getChats(
    @Query() body: GetChatsRequest,
    @SessionUser() user: UserEntity,
  ): Promise<GetChatsResponse> {
    const chats = await this.chatService.getChatsForUser(user);
    return Promise.all(chats.map((e) => this.chatService.asApiChat(e)));
  }

  @Post("/chat")
  @UseGuards(AuthGuard)
  public async createChat(
    @Query() body: CreateChatRequest,
    @SessionUser() user: UserEntity,
  ): Promise<CreateChatResponse> {
    const chat = await this.chatService.createChatForUser(user);
    // await this.astraChatService.getChat(chat.uuid);
    return this.chatService.asApiChat(chat);
  }

  @Post("/chat/:chatUuid/message")
  @UseGuards(AuthGuard, ChatGuard)
  public async send(
    @Body() body: SendChatMessageRequest,
    @Chat() chat: ChatEntity,
    @SessionUser() user: UserEntity,
  ): Promise<SendChatMessageResponse> {
    const e = new ChatEventEntity({
      type: ChatEventType.Text,
      sender: user,
      chat,
      data: body.text,
    });

    const events: ChatEventEntity[] = [];

    if (body.attachments?.length) {
      for (const mediaUuid of body.attachments) {
        const e = new ChatEventEntity({
          type: ChatEventType.Media,
          sender: user,
          chat,
          data: mediaUuid,
        });
        events.push(e);
      }
    }

    events.push(e);

    await this.chatService.handleEvent(events, body.deviceId);
    this.astraChatService.getChat(chat.uuid).then((astraChat) => {
      astraChat.next();
    });

    return {
      events: await Promise.all(
        events.map((e) => this.chatService.asApiChatEvent(e)),
      ),
    };
    // if (process.env["NODE_ENV"] === "development" && body.text === "clear") {
    //   await this.astraService.clearChat(chat.uuid);
    //   return [] as any;
    // }

    // const events: ChatEventEntity[] = [];

    // if (body.attachments?.length) {
    //   for (const mediaUuid of body.attachments) {
    //     const e = new ChatEventEntity({
    //       type: ChatEventType.Media,
    //       sender: user,
    //       chat,
    //       data: mediaUuid,
    //     });
    //     events.push(e);
    //   }
    // }

    // this.astraService.next(chat.uuid);

    // return {
    //   events: await Promise.all(
    //     events.map((e) => this.chatService.asApiChatEvent(e)),
    //   ),
    // };
  }

  @Get("/chat/:chatUuid/events")
  @UseGuards(AuthGuard, ChatGuard)
  public async getChatEvents(
    @Query() body: GetChatEventsRequest,
    @Chat() thread: ChatEntity,
    @SessionUser() user: UserEntity,
  ): Promise<GetChatEventsResponse> {
    const { events } = await this.chatService.getEvents(thread);
    return {
      events: await Promise.all(
        events.map((e) => this.chatService.asApiChatEvent(e)),
      ),
    };
  }

  @Sse("/chat/:chatUuid/sse")
  @UseGuards(AuthGuard, ChatGuard)
  public async sse(
    @Query() query: ChatEventsSseRequest,
    @Chat() chat: ChatEntity,
    @SessionUser() user: UserEntity,
  ): Promise<Observable<MessageEvent>> {
    return this.chatService.createChatEventsSse(chat);
  }
}
