import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { ChatEvent as ApiChatEvent } from "~/astra/common/chat";

import { useStore } from "../../../store/app_store_provider";
import { Body, BodyContainer } from "../ChatEvent/style";

import { Text, Container, StyledActiveBlock, TaskIcon } from "./style";

export const ActiveBlock = observer(({ event }: { event: ApiChatEvent }) => {
  const store = useStore();
  const task = store.chat.currentTask;
  const job = store.chat.currentJob;
  const textRef = useRef<HTMLDivElement | null>(null);
  const isAnimating = useRef(false);
  const transition = `transition: 0.3s ease-out opacity, 0.3s ease-out transform`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitialAnimation = useRef(true);

  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
  };

  const setStyle = (style: string, requestFrame = false) => {
    const fn = () => {
      if (!textRef.current) return;
      (textRef as any).current.style = style;
    };
    if (requestFrame) {
      animationFrameRef.current = requestAnimationFrame(fn);
    } else {
      fn();
    }
  };

  const animate = (task?: string, job?: string) => {
    clear();
    if (isAnimating.current) return;
    isAnimating.current = true;
    const initial = isInitialAnimation.current;
    isInitialAnimation.current = false;

    const fromTopToBottom = () => {
      setStyle(`transform: translateY(-16px); opacity: 0;`);
      timeoutRef.current = setTimeout(() => {
        setStyle(`transform: translateY(0px); opacity: 1; ${transition}`, true);
      }, 1);
    };

    const innerHtml = `${task}${job != null ? `<span>${job}</span>` : ``}`;

    if (!initial) {
      // animationFrameRef.current = requestAnimationFrame(() => {
      setStyle(`transform: translateY(16px); opacity: 0; ${transition}`, true);
      timeoutRef.current = setTimeout(() => {
        if (textRef.current) textRef.current.innerHTML = innerHtml;
        fromTopToBottom();
        isAnimating.current = false;
      }, 300);
      // });
    } else {
      if (textRef.current) textRef.current.innerText = innerHtml;
      fromTopToBottom();
      isAnimating.current = false;
    }
  };

  useEffect(() => {
    // setIsChanging(true);
    // const timer = setTimeout(() => setIsChanging(false), 300);
    // return () => {
    //   clearTimeout(timer);
    // };
    if (!task) return;
    animate(task, job);
  }, [task, job]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return (
    <StyledActiveBlock>
      <Container>
        <Text ref={textRef} title={task}></Text>
      </Container>
    </StyledActiveBlock>
  );
});
