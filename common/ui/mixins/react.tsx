import { CssStyle } from "../types/header";

export const withVars = (
  vars: Record<string, any>,
  style: CssStyle = {},
): CssStyle => {
  return {
    ...style,
    vars,
  };
};
