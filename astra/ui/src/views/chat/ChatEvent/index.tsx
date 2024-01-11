import { observer } from "mobx-react";
import { useCallback, useMemo, useState } from "react";
import {
  ChatEventType,
  ChatTextEvent as ApiChatTextEvent,
  ChatTaskEvent as ApiChatTaskEvent,
} from "~/astra/common/chat";

import { useStore } from "../../../store/app_store_provider";
import { ChatEvent as IChatEvent } from "../../../store/chat_store";
import { ActiveBlock } from "../ActiveBlock";
import { MarkdownBlock } from "../MarkdownBlock";
import { MediaBlock } from "../MediaBlock";
import { TextBlock } from "../TextBlock";

import { UserAvatar, BodyContainer, StyledChatEvent } from "./style";

const Renderer = observer(({ event }: { event: IChatEvent }) => {
  let child = null;

  switch (event.type) {
    case ChatEventType.Text: {
      child = <TextBlock event={event} />;
      break;
    }
    case ChatEventType.Active: {
      child = <ActiveBlock event={event} />;
      break;
    }
    case ChatEventType.Markdown: {
      child = <MarkdownBlock event={event} />;
      break;
    }
    case ChatEventType.Media: {
      child = <MediaBlock event={event} />;
      break;
    }
  }
  return child;

  // return <StyledBody isOwn={event.$isOwn}>{child}</StyledBody>;
});

export interface ChatEventProps extends React.HTMLAttributes<HTMLDivElement> {
  event: IChatEvent;
}

export const ChatEvent = observer(({ event, ...props }: ChatEventProps) => {
  const {
    type,
    data,
    $showAvatar,
    $isOwn,
    $isAvatarSpinning,
    $isAnimated,
    $hideContent,
  } = event;
  const store = useStore();
  const userAvatarUrl = $showAvatar ? `/logo.png` : undefined;

  return (
    <StyledChatEvent
      isOwn={$isOwn}
      style={{
        marginTop: type === ChatEventType.Markdown ? "0px" : "8px",
      }}
    >
      {!$isOwn && (
        <UserAvatar
          src={userAvatarUrl}
          hideSkeleton={!$showAvatar}
          draggable={false}
          spinning={$isAvatarSpinning}
        />
      )}

      {!$hideContent && (
        <BodyContainer isOwn={$isOwn} isAnimated={$isAnimated}>
          <Renderer event={event} />
        </BodyContainer>
      )}
    </StyledChatEvent>
  );
});
