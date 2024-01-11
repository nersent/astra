import { flexColumn, setVar } from "@common/ui";
import styled, { css } from "styled-components";

const VAR_NAVIGATION_HEIGHT = "--navigation-height";

export interface LayoutProps {
  noScroll?: boolean;
}

export const StyledLayout = styled.div<LayoutProps>`
  width: 100%;
  height: 100dvh;
  ${setVar(VAR_NAVIGATION_HEIGHT, "64px")};
  ${flexColumn};
  position: relative;
  overflow-x: hidden;
  overscroll-behavior: none;

  ${({ noScroll }) =>
    noScroll &&
    css`
      overflow: hidden;
    `}
`;
