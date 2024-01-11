import { css } from "styled-components";

export const gradientText = css`
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
`;

export const gradientBorder = (gradient: string, thickness: number) => css`
  position: relative;

  &::before {
    content: "";
    width: calc(100% + ${thickness * 2}px);
    height: calc(100% + ${thickness * 2}px);
    background: ${gradient};
    position: absolute;
    top: -${thickness}px;
    left: -${thickness}px;
    z-index: -1;
    border-radius: inherit;
  }
`;
