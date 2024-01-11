import { ChatTextEvent as ApiChatTextEvent } from "~/astra/common/chat";

import { StyledTextBlock } from "./style";

export const TextBlock = ({
  event,
}: {
  event: ApiChatTextEvent & { $isOwn?: boolean };
}) => {
  const { data } = event;
  if (!data?.length) return;
  return (
    <StyledTextBlock isOwn={event.$isOwn}>
      {data?.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </StyledTextBlock>
  );
};
