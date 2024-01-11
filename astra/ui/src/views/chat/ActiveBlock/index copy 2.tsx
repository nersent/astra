import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { ChatEvent as ApiChatEvent } from "~/astra/common/chat";

import { useStore } from "../../../store/app_store_provider";
import { Body } from "../ChatEvent/style";

import {
  Text,
  StyledActiveBlock,
  TaskIcon,
  Task,
  Job,
  Container,
} from "./style";

export const ActiveBlock = observer(({ event }: { event: ApiChatEvent }) => {
  const store = useStore();
  const task = store.chat.currentTask;
  const job = store.chat.currentJob;
  const [isChanging, setIsChanging] = useState(false);
  const isEmpty = !task;

  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => {
      clearTimeout(timer);
    };
  }, [task]);

  return (
    <StyledActiveBlock>
      <Container>
        <Text title={task} isChanging={isChanging}>
          {task != null && <Task>{task}</Task>}
          {task != null && job != null && (
            <>
              {task != null && <br />}
              <Job>{job}</Job>
            </>
          )}
        </Text>
      </Container>
    </StyledActiveBlock>
  );
});
