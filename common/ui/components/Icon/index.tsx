import { CSSProperties, forwardRef } from "react";

import {
  StyledIcon,
  ICON_URL_VAR_NAME,
  VAR_ICON_COLOR,
  VAR_ICON_SIZE,
} from "./style";

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  color?: string;
  boxSize?: string | number;
  boxWidth?: string | number;
  boxHeight?: string | number;
  iconSize?: string | number;
  opacity?: number;
  invert?: boolean;
  useMask?: boolean;
  rotate?: "90deg" | "180deg" | "-90deg" | "-180deg";
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(
  (
    {
      src,
      color,
      boxSize,
      boxWidth,
      boxHeight,
      iconSize,
      opacity,
      invert,
      useMask,
      style,
      rotate,
      ...props
    },
    ref,
  ) => {
    const _style: CSSProperties = {
      width: boxWidth ?? boxSize,
      height: boxHeight ?? boxSize,
      opacity,
      [ICON_URL_VAR_NAME]: `url(${src})`,
      [VAR_ICON_SIZE]: iconSize ?? "center",
      transform: rotate == null ? null : `rotate(${rotate})`,
    } as any;

    if (invert) {
      _style.filter = "invert(100%)";
    }

    if (color && useMask) {
      // _style.backgroundColor = color;
      (_style as any)[VAR_ICON_COLOR] = `${color}`;
    }

    return (
      <StyledIcon
        ref={ref}
        useMask={useMask}
        style={{ ..._style, ...style }}
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";

Icon.defaultProps = {
  color: "#000",
  boxSize: "100%",
};

Icon.toString = () => {
  return StyledIcon.toString();
};
