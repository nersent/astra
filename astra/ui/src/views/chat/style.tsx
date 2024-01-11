import styled, { css } from "styled-components";
import {
  WithVisible,
  centerIcon,
  customScroll,
  flexColumn,
  hidden,
  shadows,
  size,
} from "~/common/ui";

export const StyledChatView = styled.div`
  display: flex;
`;

export const ChatContainer = styled.div`
  width: 100%;
  max-width: 896px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;

export const ChatItems = styled.div<WithVisible>`
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 0px;
  margin-top: auto;
  ${flexColumn};
  position: relative;
  ${customScroll({
    size: "6px",
    borderRadius: "0px",
    alwaysVisible: true,
    color: "rgba(0, 0, 0, 0.16)",
    hoverColor: "rgba(0, 0, 0, 0.38)",
    activeColor: "rgba(0, 0, 0, 0.52)",
  })};

  ${({ visible }) =>
    !visible &&
    css`
      ${hidden};
    `};
`;

export const Profile = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
`;

export const Avatar = styled.div`
  ${size("200px")};
  border-radius: 100%;
  overflow: hidden;
  ${centerIcon()};
  z-index: 2;
  box-shadow: ${shadows(16, 1.4)};
`;

export const Posts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 100%;
  justify-content: center;
  padding: 0 24px;
  max-width: 640px;
`;

export const Post = styled.div`
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  padding-bottom: 100%;
`;
