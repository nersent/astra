import { css } from "styled-components";

export type Breakpoint = "sm" | "md" | "xmd" | "lg" | "xlg";

export const createBreakpoints = <T extends Record<string, number>>(
  breakpoints: T,
) => {
  return {
    down: (breakpoint: keyof T | number) => {
      // prettier-ignore-start
      // eslint-disable-next-line prettier/prettier
      return css`@media only screen and (max-width: ${typeof breakpoint === "number" ? breakpoint - 1 : breakpoints[breakpoint]! - 1}px)`;
      // prettier-ignore-end
    },
    up: (breakpoint: keyof T | number) => {
      // prettier-ignore-start
      // eslint-disable-next-line prettier/prettier
      return css`@media only screen and (min-width: ${typeof breakpoint === "number" ? breakpoint : breakpoints[breakpoint]!}px)`;
      // prettier-ignore-end
    },
    between: (min: keyof T | number, max: keyof T | number) => {
      // prettier-ignore-start
      // eslint-disable-next-line prettier/prettier
      return css`@media only screen and (min-width: ${typeof min === "number" ? min : breakpoints[min]!}px) and (max-width: ${typeof max === "number" ? max - 1 : breakpoints[max]! - 1}px)`;
      // prettier-ignore-end
    },
    get: (breakpoint: keyof T) => {
      return breakpoints[breakpoint];
    },
  };
};
