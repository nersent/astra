import { observer } from "mobx-react";
import { useEffect } from "react";

import { Layout } from "../../components/Layout";
import { useStore } from "../../store/app_store_provider";

import { AttachFilePopup } from "./AttachFilePopup";
import { BottomBar } from "./BottomBar";
import { ChatEvent } from "./ChatEvent";
import { Navbar } from "./Navbar";
import { ChatContainer, ChatItems, StyledChatView } from "./style";

export const ChatView = observer(() => {
  const store = useStore();

  return (
    <StyledChatView>
      <Navbar />
      <Layout noScroll>
        <ChatContainer>
          <ChatItems
            ref={store.chat.contentRef}
            visible={store.chat.isContentVisible}
          >
            {store.chat.content.map((event) => (
              <ChatEvent key={event.uuid} event={event} />
            ))}
          </ChatItems>
          <AttachFilePopup />
          <BottomBar />
        </ChatContainer>
      </Layout>
    </StyledChatView>
  );
});
