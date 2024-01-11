import { css } from "styled-components";

export const centerHorizontal = css`
  left: 50%;
  transform: translateX(-50%);
`;

export const centerBoth = css`
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const centerVertical = css`
  top: 50%;
  transform: translateY(-50%);
`;

export const spaceAround = css`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export const centerHorizontalMargin = css`
  margin-left: auto;
  margin-right: auto;
`;
