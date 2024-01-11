import { css } from "styled-components";

export const fixChromiumBlur = css`
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  perspective: 1000;
`;
