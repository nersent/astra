import { css } from "styled-components";

export const centerIcon = (size = "cover", mask = false) => css`
  ${mask ? "mask" : "background"}-size: ${size};
  ${mask ? "mask" : "background"}-position: center;
  ${mask ? "mask" : "background"}-repeat: no-repeat;
`;

export const iconSrc = (src: string, mask = false) => css`
  ${mask ? "-webkit-mask-image" : "background-image"}: url(${src});
`;

export const customImage = (
  width: string,
  height: string,
  left: string,
  top: string,
) => css`
  background-size: ${width} ${height};
  background-position: ${left} ${top};
  background-repeat: no-repeat;
`;

export const coverImage = css`
  background-size: cover;
  background-repeat: no-repeat;
`;

export const invert = css`
  filter: invert(100%);
`;

export const asUrl = (url: string) => `url(${url})`;

export const maskColor = (color: string) => css`
  background-color: ${color};
`;
