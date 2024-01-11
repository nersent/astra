import { css } from "styled-components";

import { borderShadow } from "./box";

export const noUserSelect = css`
  user-select: none;
`;

export const noUserDrag = css`
  user-drag: none;
`;

export const noTapHighlight = css`
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0) !important;
`;

export const asFocusSelector = `&:focus, &:focus-within, &:active`;

export const focusOutline = (color: string) => css`
  ${asFocusSelector} {
    outline: none;
    ${borderShadow(color, "2px")};
  }
`;

export const noEvents = css`
  pointer-events: none;
`;

export const withEvents = css`
  pointer-events: auto;
`;

export const hidden = css`
  pointer-events: none;
  opacity: 0;
`;

export const visible = css`
  pointer-events: auto;
  opacity: 1;
`;

export const noScroll = css`
  overflow: hidden;
`;

export const noScrollAnchor = css`
  overflow-anchor: none;
`;
