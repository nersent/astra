import { css } from "styled-components";

import { noUserSelect } from "./ux";

export const clearDefaultAnchorStyle = css`
  color: inherit;
  text-decoration: none;

  &:focus {
    outline: none;
  }
`;

export const clearDefaultUlStyle = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const clearDefaultLiStyle = css`
  margin: 0;
`;

export const clearDefaultButtonStyle = css`
  outline: none;
  border: none;
  background-color: transparent;
  font-family: inherit;
  ${noUserSelect};
`;

export const clearDefaultInputStyle = css`
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

export const clearDefaultFocusOutline = css`
  &:focus {
    outline: none;
  }
`;

export const clearDefaultSmallStyle = css`
  font-size: inherit;
  display: block;
`;

export const clearDefaultFigureStyle = css`
  margin-block: 0px;
  margin-inline: 0px;
`;

export const clearDefaultStrongStyle = css`
  font-weight: inherit;
  line-height: inherit;
`;
