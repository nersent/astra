import { css } from "styled-components";

export const borderShadow = (color: string, thickness = "1px") => css`
  box-shadow: 0 0 0 ${thickness} ${color};
`;

export const size = (size: string) => css`
  width: ${size};
  height: ${size};
`;

export const maxSize = (size: string) => css`
  max-width: ${size};
  max-height: ${size};
`;

export const flexRow = css`
  display: flex;
  flex-direction: row;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const innerBackgroundColor = (
  color: string,
  target: "after" | "before" = "before",
) => css`
  &::${target} {
    content: "";
    display: block;
    background-color: ${color};
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export const flexCenterBoth = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const borderY = (border: string) => css`
  border-top: ${border};
  border-bottom: ${border};
`;

export const borderX = (border: string) => css`
  border-left: ${border};
  border-right: ${border};
`;

export const circle = css`
  border-radius: 100%;
`;

export const rounded = css`
  border-radius: 10000px;
`;

export const getInnerBorderRadius = (outerRadius: string, distance: string) =>
  `calc(${outerRadius} - ${distance})`;
