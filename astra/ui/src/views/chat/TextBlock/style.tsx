import styled, { css } from "styled-components";

import { Body, WithIsOwn } from "../ChatEvent/style";

export const baseTextStyle = css`
  border-radius: 24px;
  padding: 12px 16px;
  font-size: 16px;
  cursor: text;
  line-height: 1.5;
  background-color: rgba(255, 255, 255, 0.1);

  & p {
    margin: 0px;
  }
`;

export const StyledTextBlock = styled(Body)`
  ${baseTextStyle}
  color: #000;
  background-color: rgba(0, 0, 0, 0.08);

  ${({ isOwn }) =>
    isOwn &&
    css`
      color: #fff;
      background-color: #222327;
    `};
`;
