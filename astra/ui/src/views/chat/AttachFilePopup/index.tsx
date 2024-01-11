import { observer } from "mobx-react";

import { useStore } from "../../../store/app_store_provider";

import { Icon, StyledAttachFilePopup, Text } from "./style";

export const AttachFilePopup = observer(() => {
  const store = useStore();
  const visible = store.chat.input.isAttachFilePopupVisible;
  return (
    <StyledAttachFilePopup
      ref={store.chat.input.attachFilePopupRef}
      visible={visible}
    >
      <Icon />
      <Text>Drop any file here to add it to the conversation</Text>
    </StyledAttachFilePopup>
  );
});
