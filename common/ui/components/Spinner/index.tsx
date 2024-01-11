import React from "react";

import { Path, StyledSpinner, SpinnerContainer } from "./style";

export const COLOR_BLUE_PRIMARY = "#6ec6ff";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  thickness?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ color, thickness, ...props }, ref) => {
    return (
      <SpinnerContainer ref={ref} {...props}>
        <StyledSpinner stroke={color} viewBox="0 0 66 66">
          <Path
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="square"
            cx="33"
            cy="33"
            r="30"
          ></Path>
        </StyledSpinner>
      </SpinnerContainer>
    );
  },
);

Spinner.displayName = "Spinner";

Spinner.defaultProps = {
  thickness: "4px",
  color: COLOR_BLUE_PRIMARY,
};
