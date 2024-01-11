import {
  VAR_UI_BUTTON_BACKGROUND,
  VAR_UI_BUTTON_BORDER,
  VAR_UI_BUTTON_COLOR,
  VAR_UI_BUTTON_FOCUS_BACKGROUND,
  VAR_UI_BUTTON_FOCUS_OUTLINE,
  VAR_UI_BUTTON_HOVER_BACKGROUND,
  noScroll,
  noScrollAnchor,
} from "@common/ui";
import styled, { createGlobalStyle } from "styled-components";

import { interRegular } from "../mixins/typography";

export const VAR_PRIMARY_COLOR = "--color-primary";
export const VAR_SECONDARY_COLOR = "--color-secondary";

export const GlobalStyle = createGlobalStyle`
  body {
    width: 100%;
    height: 100%;
    cursor: default;
    margin: 0;
    padding: 0;
    background-color: #fff;
    color: #000;
    font-size: 14px;
    position: relative;
    overflow: hidden;
    ${noScrollAnchor};
    ${interRegular};
  }

  * {
    box-sizing: border-box;
  }

  :root {
  --font-sans: "Inter",sans-serif;
}
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1536px;
  margin: 0 auto;
`;
