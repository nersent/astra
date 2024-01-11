import { css } from "styled-components";

export const FONT_NORMAL_WEIGHT = 400;

export const FONT_MEDIUM_WEIGHT = 500;

export const FONT_BOLD_WEIGHT = 600;

export const FONT_EXTRA_BOLD_WEIGHT = 700;

export const getLetterSpacing = (fontSize: number, tracking: number) =>
  tracking / fontSize;

export const fontRule = (name: string, weight: number) => css`
  font-family: ${name}, sans-serif;
  font-weight: ${weight};
`;

export const maxLines = (count: number) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${count};
  -webkit-box-orient: vertical;
`;

export const singleLine = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const normalFont = css`
  font-weight: ${FONT_NORMAL_WEIGHT};
`;

export const mediumFont = css`
  font-weight: ${FONT_MEDIUM_WEIGHT};
`;

export const boldFont = css`
  font-weight: ${FONT_BOLD_WEIGHT};
`;

export const extraBoldFont = css`
  font-weight: ${FONT_EXTRA_BOLD_WEIGHT};
`;

export const customSelection = (foreground: string, background: string) => css`
  & ::selection {
    color: ${foreground};
    background: ${background};
  }
`;

export const upperCase = css`
  text-transform: uppercase;
`;

export const lowerCase = css`
  text-transform: lowercase;
`;
