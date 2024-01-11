export interface Chat {
  uuid: string;
  title?: string;
  lastActivityAt: number;
  participant?: string;
}

export interface BaseChatEvent {
  type: ChatEventType;
  uuid: string;
  chatUuid: string;
  createdAt: number;
}

interface WithSender {
  senderUuid?: string;
}

export interface ChatTextEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Text;
  data: string;
}

export interface ChatMarkdownEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Markdown;
  data: string;
}

export interface ChatMediaEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Media;
  data: string;
}

export interface ChatActiveEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Active;
  data: boolean;
}

export interface ChatTaskEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Task;
  data: {
    description?: string;
    done?: boolean;
  };
}

export interface ChatJobEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Job;
  data: {
    description?: string;
    done?: boolean;
  };
}

export interface ChatDiffEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Diff;
  data: {
    targetEventUuid: string;
    diff: string;
    isFinal: boolean;
  };
}

export type ChatEvent =
  | ChatTextEvent
  | ChatMarkdownEvent
  | ChatMediaEvent
  | ChatActiveEvent
  | ChatDiffEvent
  | ChatTaskEvent
  | ChatJobEvent;

export type ChatEvents = {
  [ChatEventType.Text]: ChatTextEvent;
  [ChatEventType.Markdown]: ChatMarkdownEvent;
  [ChatEventType.Media]: ChatMediaEvent;
  [ChatEventType.Active]: ChatActiveEvent;
  [ChatEventType.Diff]: ChatDiffEvent;
  [ChatEventType.Task]: ChatTaskEvent;
  [ChatEventType.Job]: ChatJobEvent;
};

export type ChatEventData = ChatEvent["data"];

export enum ChatEventType {
  Text = 0,
  Markdown = 1,
  Media = 2,
  Active = 3,
  Diff = 4,
  Task = 5,
  Job = 6,
}
