import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { ChatMediaEvent as ApiChatMediaEvent } from "~/astra/common/chat";

import { useStore } from "../../../store/app_store_provider";
import { Body } from "../ChatEvent/style";

import { StyledMediaBlock } from "./style";

export const MediaBlock = observer(
  ({ event }: { event: ApiChatMediaEvent }) => {
    const store = useStore();
    const mediaUuid = event.data;
    const media = store.api.medias.get(mediaUuid);
    return (
      <StyledMediaBlock>
        <img src={media?.url} draggable={false} />
      </StyledMediaBlock>
    );
  },
);
