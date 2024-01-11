import { computed, makeObservable, observable } from "mobx";
import { enableStaticRendering } from "mobx-react";
import { Chat } from "~/astra/common/chat";

import { ApiClient } from "./api_client";
import { ChatStore } from "./chat_store";

enableStaticRendering(typeof window === "undefined");

export class AppStore {
  public readonly chat: ChatStore;
  public readonly api: ApiClient;
  public defaultChatUuid: string | undefined = undefined;
  public isInitialized = false;

  constructor() {
    makeObservable(this, { isInitialized: observable });
    this.api = new ApiClient(this);
    this.chat = new ChatStore(this);
    this.api.on("authenticated", this.tryInit.bind(this));
  }

  public init(): void {
    if (this.isInitialized) return;
    if (!this.api.isAuthenticated) {
      this.api
        .getMe()
        .catch((err) => {
          console.log(err);
          this.isInitialized = true;
        })
        .then(() => {
          this.isInitialized = true;
        });
    }
  }

  public async tryInit(): Promise<boolean> {
    if (!this.api.isAuthenticated) return false;
    const chats = await this.api.getChats();
    let chat: Chat | undefined;
    if (chats.size === 0) {
      chat = await this.api.createChat();
    } else {
      const chats = [...this.api.chats.values()];
      if (this.defaultChatUuid != null) {
        chat = chats.find((e) => e.uuid === this.defaultChatUuid);
      }
      chat ??= chats[0];
    }
    if (chat == null) throw new Error("No chat found");
    await this.chat.load(chat.uuid);
    return true;
  }
}
