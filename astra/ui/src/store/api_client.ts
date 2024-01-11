import axios, { AxiosInstance, AxiosResponse } from "axios";
import { action, computed, makeObservable, observable } from "mobx";
import Router from "next/router";
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
} from "~/astra/common/auth_api";
import { Chat } from "~/astra/common/chat";
import {
  CreateChatRequest,
  CreateChatResponse,
  GetChatEventsRequest,
  GetChatEventsResponse,
  GetChatsRequest,
  GetChatsResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "~/astra/common/chat_api";
import { Media } from "~/astra/common/media";
import {
  GetMediaRequest,
  GetMediaResponse,
  UploadMediaResponse,
  UploadRequest,
} from "~/astra/common/media_api";
import { Me } from "~/astra/common/user";
import { GetMeRequest, GetMeResponse } from "~/astra/common/user_api";
import {
  EventRegistry,
  EventEmitter,
  asArray,
  unique,
  randomString,
} from "~/common/js";

import { AppStore } from "./app_store";

export interface WithChatUuid {
  readonly chatUuid: string;
}

export interface WithFile {
  readonly file: File;
}

export interface WithUuid {
  readonly uuid: string;
}

export interface UploadMediaProgressEvent {
  req: UploadRequest & WithFile;
  pct: number;
}

export interface AuthenticatedEvent {
  me: Me;
}

export type ApiClientEvents = {
  uploadMediaProgress: (e: UploadMediaProgressEvent) => void;
  authenticated: (e: AuthenticatedEvent) => void;
};

export class ApiClient extends EventRegistry<ApiClientEvents> {
  private readonly emitter = new EventEmitter<ApiClientEvents>(this);

  protected readonly apiClient: AxiosInstance;

  public readonly deviceId: string;
  public me: Me | undefined = undefined;
  public chats = new Map<string, Chat>();
  public medias = new Map<string, Media>();

  constructor(private readonly appStore: AppStore) {
    super();
    this.deviceId = randomString();
    makeObservable(this, {
      me: observable,
      isAuthenticated: computed,
      medias: observable,
      chats: observable,
      chatsByLastActivity: computed,
    });
    this.apiClient = axios.create({
      baseURL: this.apiBaseUrl,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": this.deviceId,
      },
    });
  }

  public get apiBaseUrl(): string {
    return process.env["API_URL"] as string;
  }

  public get chatsByLastActivity(): Chat[] {
    return [...this.chats.values()].sort(
      (a, b) => b.lastActivityAt - a.lastActivityAt,
    );
  }

  public clearMeData(): void {
    this.me = undefined;
  }

  public async login(req: AuthLoginRequest): Promise<AuthLoginResponse> {
    this.clearMeData();
    const { data: res } = await this.apiClient.post<
      AuthLoginRequest,
      AxiosResponse<AuthLoginResponse>
    >(`/auth/login`, req);
    return res;
  }

  public async logout(): Promise<void> {
    this.clearMeData();
    const res = await this.apiClient.get(`/auth/logout`);
    Router.push("/");
  }

  public async register(
    req: AuthRegisterRequest,
  ): Promise<AuthRegisterResponse> {
    const { data: res } = await this.apiClient.post<
      AuthRegisterRequest,
      AxiosResponse<AuthRegisterResponse>
    >(`/auth/register`, req);
    return res;
  }

  public get isAuthenticated(): boolean {
    return this.me != null;
  }

  public updateMe(me: Partial<Me>): void {
    this.me = { ...(this.me ?? {}), ...me } as Me;
    localStorage.setItem("me", JSON.stringify(this.me));
  }

  public async getMe(): Promise<void> {
    const res = await this.apiClient.get<
      GetMeRequest,
      AxiosResponse<GetMeResponse>
    >("/me");
    this.updateMe(res.data);
    this.emitter.emit("authenticated", { me: this.me! });
  }

  public async getMedia(uuid: string): Promise<GetMediaResponse> {
    const { data: res } = await this.apiClient.get<
      GetMediaRequest,
      AxiosResponse<GetMediaResponse>
    >(`/media/info/${uuid}`);
    this.medias.set(uuid, res.media);
    return res;
  }

  public async getChats(): Promise<Map<string, Chat>> {
    const { data } = await this.apiClient.get<
      GetChatsRequest,
      AxiosResponse<GetChatsResponse>
    >(`/chats`);
    for (const chat of data) {
      this.chats.set(chat.uuid, chat);
    }
    return this.chats;
  }

  public async createChat(): Promise<Chat> {
    const { data } = await this.apiClient.post<
      CreateChatRequest,
      AxiosResponse<CreateChatResponse>
    >(`/chat`);
    this.chats.set(data.uuid, data);
    return data;
  }

  public async getChatEvents(
    req: GetChatEventsRequest & WithChatUuid,
  ): Promise<GetChatEventsResponse> {
    return this.apiClient
      .get<GetChatEventsRequest, AxiosResponse<GetChatEventsResponse>>(
        `/chat/${req.chatUuid}/events`,
        { params: req },
      )
      .then((res) => res.data);
  }

  public async getChat(uuid: string): Promise<Chat> {
    if (!this.chats.has(uuid)) {
      await this.getChats();
    }
    return this.chats.get(uuid)!;
  }

  public async sendChatMessage(
    req: SendChatMessageRequest & WithChatUuid,
  ): Promise<SendChatMessageResponse> {
    const { data: res } = await this.apiClient.post<
      SendChatMessageRequest,
      AxiosResponse<SendChatMessageResponse>
    >(`/chat/${req.chatUuid}/message`, {
      deviceId: this.deviceId,
      ...req,
    });
    if (process.env["NODE_ENV"] === "development") {
      if (req.text === "clear") {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
    return res;
  }

  public createChatEventsObserver(req: WithChatUuid): EventSource {
    return new EventSource(`${this.apiBaseUrl}/chat/${req.chatUuid}/sse`, {
      withCredentials: true,
    });
  }

  public async uploadMedia(
    req: UploadRequest & WithFile,
  ): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append("deviceId", this.deviceId);
    formData.append("file", req.file);
    const { data: res } = await this.apiClient.post<
      UploadRequest,
      AxiosResponse<UploadMediaResponse>
    >(`/media/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (e) => {
        const pct = Math.round(e.loaded / e.total);
        this.emitter.emit("uploadMediaProgress", { req, pct });
      },
    });
    this.medias.set(res.media.uuid, res.media);
    return res;
  }
}
