import { observer } from "mobx-react";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";

import { AUTH_ROUTE } from "../../constants/routes";
import { useStore } from "../../store/app_store_provider";

import { LayoutProps, StyledLayout } from "./style";

export const Layout = observer(
  ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & LayoutProps) => {
    const store = useStore();
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //   const resize = () => {
    //     if (!ref.current) return;
    //     ref.current.style.height = window.visualViewport?.height + "px";
    //   };

    //   window.addEventListener("resize", resize);

    //   return () => {
    //     window.removeEventListener("resize", resize);
    //   };
    // }, []);

    return (
      <StyledLayout ref={ref} {...props}>
        {children}
        {/* <MediaPopup /> */}
      </StyledLayout>
    );
  },
);
