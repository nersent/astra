import { css } from "styled-components";

export const coloredCursor = (cursorColor: string, textColor = "#000") => css`
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 0px 0px ${textColor};
  color: ${cursorColor};
`;
