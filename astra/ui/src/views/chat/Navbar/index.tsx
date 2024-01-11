import { observer } from "mobx-react";
import React, { useState } from "react";
import { Chat } from "~/astra/common/chat";

import { useStore } from "../../../store/app_store_provider";

import {
  AddIcon,
  Chats,
  ChatsLabel,
  Footer,
  Header,
  HeaderLogoImage,
  StyledItem,
  StyledNavbar,
  UserIcon,
  UserProfileButton,
} from "./style";

const ChatItem = observer(({ data }: { data: Chat }) => {
  const store = useStore();
  const [isEdit, setIsEdit] = useState(false);

  const onClick = () => {
    store.chat.load(data.uuid);
  };

  return (
    <StyledItem onClick={onClick}>
      <span>{data.title ?? "New chat"}</span>
    </StyledItem>
  );
});

export const Navbar = observer(() => {
  const store = useStore();

  const onHeaderClick = async () => {
    const chat = await store.api.createChat();
    await store.chat.load(chat.uuid);
  };

  return (
    <StyledNavbar>
      <Header onClick={onHeaderClick}>
        <HeaderLogoImage />
        Astra
        <AddIcon />
      </Header>
      <ChatsLabel>Previous chats</ChatsLabel>
      <Chats>
        {store.api.chatsByLastActivity.map((chat) => (
          <ChatItem key={chat.uuid} data={chat} />
        ))}
      </Chats>
      <Footer>
        <UserProfileButton>
          <UserIcon />
          <span>Mikołaj Palkiewicz</span>
        </UserProfileButton>
      </Footer>
    </StyledNavbar>
  );
});
