import React, { forwardRef } from "react";

import { StyledSkeleton } from "./style";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ ...props }, ref) => {
    return <StyledSkeleton ref={ref} {...props} />;
  },
);

Skeleton.displayName = "Skeleton";

export * from "./style";
