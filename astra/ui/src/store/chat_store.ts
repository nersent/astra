import {
  asArray,
  clearInput,
  delay,
  filterNullable,
  formatDateShortHeader,
  hoursToMs,
  pushSet,
  randomString,
  readBrowserFile,
} from "@common/js";
import { PopupStore } from "@common/ui";
import axios, { AxiosResponse } from "axios";
import { action, computed, makeObservable, observable } from "mobx";
import Router from "next/router";
import { createRef } from "react";
import {
  ChatEvent as ApiChatEvent,
  Chat as ApiChat,
  ChatEventType,
  ChatMediaEvent,
  ChatTextEvent,
} from "~/astra/common/chat";
import { ChatEventsSseResponse } from "~/astra/common/chat_api";

import { ApiClient } from "./api_client";
import { AppStore } from "./app_store";
import { ChatInputStore } from "./chat_input_store";

export type ChatEvent = ApiChatEvent & {
  $showAvatar?: boolean;
  $isOwn?: boolean;
  $isCompleted?: boolean;
  $isAvatarSpinning?: boolean;
  $isAnimated?: boolean;
  $hideContent?: boolean;
};

export class ChatStore {
  public readonly input: ChatInputStore;
  public data: ApiChat | undefined = undefined;
  public events: ChatEvent[] = [];
  public eventUuids = new Set<string>();
  public eventSource: EventSource | undefined = undefined;
  public isLoading = true;
  public hasMoreEvents = true;
  public userInputRef = createRef<HTMLInputElement>();
  public contentRef = createRef<HTMLDivElement>();
  public bottomBarRef = createRef<HTMLDivElement>();
  public isContentVisible = false;
  public isActive = false;
  public currentTask: string | undefined = undefined;
  public currentJob: string | undefined = undefined;

  constructor(private readonly store: AppStore) {
    this.input = new ChatInputStore(store);
    makeObservable(this, {
      data: observable,
      events: observable,
      isLoading: observable,
      hasMoreEvents: observable,
      isContentVisible: observable,
      content: computed,
      title: computed,
      load: action,
      loadMessages: action,
      onSseEvent: action,
      addEvents: action,
      isActive: observable,
      currentTask: observable,
      currentJob: observable,
    });
  }

  public get title(): string | undefined {
    return this.data?.title;
  }

  public async loadMessages(): Promise<void> {
    if (!this.hasMoreEvents) return;
    if (this.data == null) return;
    console.log(`Loading messages: Current: ${this.events.length}`);
    this.isLoading = true;

    const { events } = await this.store.api.getChatEvents({
      chatUuid: this.data.uuid,
    });
    this.hasMoreEvents = false;

    await this.addEvents(events);
    this.isLoading = false;
  }

  public async load(chatUuid: string): Promise<void> {
    if (chatUuid == null) throw new Error("chatUuid is null");
    if (this.data?.uuid === chatUuid) {
      this.scrollToBottom();
      return;
    }

    Router.push(`/c/${chatUuid}`);

    this.isContentVisible = false;
    this.isLoading = true;
    this.eventSource?.close();
    this.eventSource?.removeEventListener("message", this.onSseEvent);
    this.events = [];
    this.eventUuids = new Set<string>();
    this.hasMoreEvents = true;
    this.currentTask = undefined;
    this.currentJob = undefined;
    this.isActive = false;

    const data = await this.store.api.getChat(chatUuid);
    this.data = data;

    if (!data) {
      return;
    }

    await this.loadMessages();

    this.scrollToBottom();

    this.eventSource = this.store.api.createChatEventsObserver({
      chatUuid: data.uuid,
    });
    this.eventSource.addEventListener("message", this.onSseEvent);

    this.isContentVisible = true;

    // setTimeout(() => {
    //   this.isActive = true;
    //   this.addEvents([
    //     {
    //       uuid: "Xdd",
    //       type: ChatEventType.Task,
    //       data: { description: "Get current weather" },
    //     } as any,
    //   ]);

    //   setTimeout(() => {
    //     this.addEvents([
    //       {
    //         uuid: "gowno",
    //         type: ChatEventType.Task,
    //         data: { description: "Write python" },
    //       } as any,
    //       {
    //         uuid: "gowno",
    //         type: ChatEventType.Job,
    //         data: { description: "gowno" },
    //       } as any,
    //     ]);
    //   }, 2000);
    // }, 1000);
  }

  public get content(): ChatEvent[] {
    const meUuid = this.store.api.me?.uuid;
    if (this.data == null || meUuid == null) {
      return [];
    }

    const eventGroups: ChatEvent[] = [];

    for (let i = 0; i < this.events.length; i++) {
      const e = this.events[i];
      const nextE = this.events[i + 1];

      const isOwn = e.senderUuid === meUuid;
      const isLastMessage =
        i === this.events.length - 1 ||
        nextE == null ||
        nextE.senderUuid !== e.senderUuid;

      const showAvatar = !isOwn && isLastMessage;

      eventGroups.push({
        ...e,
        $showAvatar: showAvatar,
        $isOwn: isOwn,
      });
    }

    if (this.isActive) {
      eventGroups.push({
        type: ChatEventType.Active,
        chatUuid: this.data.uuid,
        uuid: "active",
        $showAvatar: true,
        data: true,
        $isAvatarSpinning: true,
        createdAt: Date.now(),
        $isAnimated: false,
      });
    }

    return eventGroups;
  }

  public onSseEvent = async ({ data }: any): Promise<void> => {
    const e = JSON.parse(data) as ChatEventsSseResponse;
    if (process.env["NODE_ENV"] === "development") {
      console.log(
        e.deviceId != null && this.store.api.deviceId === e.deviceId,
        e,
      );
    }
    if (e.deviceId != null && this.store.api.deviceId === e.deviceId) return;
    this.addEvents(e.events.map((r) => ({ ...r, $isAnimated: true })));
  };

  public async addEvents(events: ChatEvent | ChatEvent[]): Promise<void> {
    if (process.env["NODE_ENV"] === "development") {
      console.log(events);
    }
    if (this.data == null) return;
    events = asArray(events);

    const promises: Promise<any>[] = [
      ...events
        .filter((r) => r.type === ChatEventType.Media)
        .map((r) => (r as ChatMediaEvent).data)
        .map((r) => this.store.api.getMedia(r)),
    ];
    await Promise.all(promises);

    for (const e of events) {
      if (e.type === ChatEventType.Active) {
        if (!e.data) this.isActive = false;
        continue;
      }
      if (e.type === ChatEventType.Task) {
        this.currentTask = e.data.description;
        if (this.currentTask == null) this.currentJob = undefined;
        continue;
      }
      if (e.type === ChatEventType.Job) {
        this.currentJob = e.data.description;
        continue;
      }
      if (this.eventUuids.has(e.uuid)) {
        const index = this.events.findIndex((r) => r.uuid === e.uuid);
        this.events[index] = e;
      } else {
        this.events.push(e);
        this.events.sort((a, b) => a.createdAt - b.createdAt);
      }
      this.eventUuids.add(e.uuid);
    }

    this.tryToScrollToBottom();
  }

  public tryToScrollToBottom(): void {
    if (this.isScrollNearBottom()) {
      this.scrollToBottom();
    }
  }

  public scrollToBottom(animate = false): void {
    setTimeout(() => {
      if (this.contentRef.current == null) return;
      if (animate) {
        this.contentRef.current.scrollTo({
          top: this.contentRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        this.contentRef.current.scrollTo({
          top: this.contentRef.current.scrollHeight,
          behavior: "instant",
        });
      }
    }, 50);
  }

  public isScrollNearBottom(threshold = 256): boolean {
    if (this.contentRef.current == null) return true;
    const { scrollHeight, scrollTop, clientHeight } = this.contentRef.current;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }
}
