import { css } from "styled-components";

import { noUserSelect } from "./ux";

export const clearAnchor = css`
  color: inherit;
  text-decoration: none;

  &:focus {
    outline: none;
  }
`;

export const clearUl = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const clearLi = css`
  margin: 0;
`;

export const clearButton = css`
  outline: none;
  border: none;
  background-color: transparent;
  font-family: inherit;
  ${noUserSelect};
`;

export const clearInput = css`
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  border: none;
  outline: none;
  background-color: transparent;

  &::placeholder {
    ${noUserSelect};
    ${noUserSelect};
  }
`;

export const clearFocusOutline = css`
  &:focus {
    outline: none;
  }
`;

export const clearSmall = css`
  font-size: inherit;
  display: block;
`;

export const clearFigure = css`
  margin-block: 0px;
  margin-inline: 0px;
`;

export const clearStrong = css`
  font-weight: inherit;
  line-height: inherit;
`;
