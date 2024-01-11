import React, { useCallback, useEffect, useState } from "react";

import { WithVisible } from "../../types/state";
import { Skeleton } from "../Skeleton";

import { ImageContainer, StyledImage } from "./style";

export interface ImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
  skeleton?: React.ReactNode | true;
  hideSkeleton?: boolean;
  alt?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    { src, skeleton, draggable, children, hideSkeleton, alt, ...props },
    ref,
  ) => {
    // if (!src?.startsWith("http")) {
    //   src = "http://" + window.location.host + src;
    // }

    const [isLoaded, setLoaded] = useState(false);

    const onLoad = useCallback(() => {
      setLoaded(true);
    }, []);

    useEffect(() => {
      setLoaded(false);
    }, [src]);

    let _skeleton: React.ReactNode | undefined = undefined;

    if (skeleton === true || skeleton == null) {
      _skeleton = <Skeleton />;
    } else if (skeleton) {
      _skeleton = <>{skeleton}</>;
    }

    return (
      <ImageContainer ref={ref} draggable={!!draggable} {...props}>
        {src != null && (
          <>
            <StyledImage
              src={src}
              onLoad={onLoad}
              loaded={isLoaded}
              draggable={draggable}
              alt={alt}
            />
          </>
        )}
        {!isLoaded && !hideSkeleton && _skeleton}
        {children}
      </ImageContainer>
    );
  },
);

Image.displayName = "Image";
