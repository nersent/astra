import React from "react";

import { Path, StyledSpinner, SpinnerContainer } from "./style";

export const COLOR_BLUE_PRIMARY = "#6ec6ff";

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  thickness?: string;
  value?: number;
}

export const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(({ color, thickness, value, ...props }, ref) => {
  value ??= 1;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - value * circumference;

  return (
    <SpinnerContainer ref={ref} {...props}>
      <StyledSpinner stroke={color} viewBox="0 0 66 66">
        <Path
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="square"
          cx="33"
          cy="33"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        ></Path>
      </StyledSpinner>
    </SpinnerContainer>
  );
});

CircularProgress.displayName = "Spinner";

CircularProgress.defaultProps = {
  thickness: "4px",
  color: COLOR_BLUE_PRIMARY,
};
