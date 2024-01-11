import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { CircularProgress } from "~/common/ui/components/CircularProgress";
import { ICON_ATTACH_FILE, ICON_SEND } from "~/common/ui/icons";

import { COLOR_PRIMARY } from "../../../constants/colors";
import { useStore } from "../../../store/app_store_provider";
import { Attachment } from "../../../store/chat_input_store";

import {
  ActionButton,
  Container,
  StyledInput,
  StyledBottomBar,
  StyledAttachedFile,
  TextInput,
  Attachments,
  RemoveAttachedFileIcon,
  FileIconContainer,
} from "./style";

const AttachedFile = observer(({ data }: { data: Attachment }) => {
  const store = useStore();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const onRemoveClick = () => {
    store.chat.input.removeFile(data.file);
  };

  console.log(data.isUploaded, data.uploadPct);

  return (
    <StyledAttachedFile title={data.file.name} onClick={onClick}>
      {!data.isUploaded && (
        <FileIconContainer>
          <CircularProgress color={COLOR_PRIMARY} value={data.uploadPct} />
        </FileIconContainer>
      )}
      <span>{data.file.name}</span>
      <RemoveAttachedFileIcon onClick={onRemoveClick} />
    </StyledAttachedFile>
  );
});

const Input = observer(() => {
  const store = useStore();
  const attachments = store.chat.input.attachments;

  const onClick = () => {
    store.chat.input.inputRef.current?.focus();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.chat.input.text = e.target.value;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      store.chat.input.send();
    }
  };

  return (
    <>
      <StyledInput onClick={onClick}>
        {attachments.length > 0 && (
          <Attachments>
            {attachments.map((r, index) => (
              <AttachedFile key={index} data={r} />
            ))}
          </Attachments>
        )}
        <TextInput
          ref={store.chat.input.inputRef}
          placeholder="Ask a question"
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </StyledInput>
    </>
  );
});

export const BottomBar = observer(() => {
  const store = useStore();

  return (
    <StyledBottomBar ref={store.chat.input.bottomBarRef}>
      <Container>
        <ActionButton
          iconSrc={ICON_ATTACH_FILE}
          onClick={store.chat.input.openFileSelectPopup.bind(store.chat.input)}
        />
        <Input />
        <ActionButton
          iconSrc={ICON_SEND}
          disabled={store.chat.input.isEmpty}
          onClick={() => store.chat.input.send()}
        />
      </Container>
    </StyledBottomBar>
  );
});
