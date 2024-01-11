import { size, maskColor, Image, circle, rounded } from "@common/ui";
import styled, { css, keyframes } from "styled-components";

export interface WithIsOwn {
  isOwn?: boolean;
}

export const StyledChatEvent = styled.div<WithIsOwn>`
  width: 100%;
  margin-top: 8px;
  border-radius: 16px;
  padding: 0px 16px;
  display: flex;
  flex-shrink: 0;
  ${({ isOwn }) =>
    isOwn &&
    css`
      flex-direction: row-reverse;
    `}
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const UserAvatar = styled(Image)`
  flex-shrink: 0;
  ${size("32px")}
  ${circle};
  margin-top: auto;

  ${({ spinning }: { spinning?: boolean }) =>
    spinning &&
    css`
      animation: ${spinAnimation} 1.2s ease-in-out infinite;
    `};
`;
export const fadeInFromBottomAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`;

export const BodyContainer = styled.div<WithIsOwn & { isAnimated?: boolean }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
  max-width: 75%;
  width: 100%;

  ${({ isOwn }) =>
    isOwn &&
    css`
      max-width: 75%;
    `}

  ${({ isAnimated }) =>
    isAnimated &&
    css`
      animation: ${fadeInFromBottomAnimation} 0.15s ease-out;
    `}
`;

export const Body = styled.div<WithIsOwn>`
  ${({ isOwn }) =>
    isOwn &&
    css`
      margin-left: auto;
    `}
`;
