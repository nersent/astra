import {
  IsArray,
  IsBase64,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

import { Chat, ChatEvent, ChatMediaEvent, ChatTextEvent } from "./chat";

export class GetChatsRequest {}

export type GetChatsResponse = Chat[];

export class GetChatEventsRequest {}

export class CreateChatRequest {}

export type CreateChatResponse = Chat;

export interface GetChatEventsResponse {
  events: ChatEvent[];
}

export class SendChatMessageRequest {
  @IsString()
  text!: string;

  @IsString()
  deviceId?: string;

  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export interface SendChatMessageResponse {
  events: ChatEvent[];
}

export class SendChatMediaRequest {
  @IsString()
  deviceId?: string;
}

export class ChatEventsSseRequest {}

export type ChatEventsSseResponse = {
  events: ChatEvent[];
  deviceId?: string;
};
