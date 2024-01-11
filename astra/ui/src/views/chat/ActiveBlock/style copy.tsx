import styled, { css, keyframes } from "styled-components";
import { ICON_CUBE } from "~/common/ui/icons";
import {
  size,
  borderShadow,
  getInnerBorderRadius,
} from "~/common/ui/mixins/box";
import { gradientBorder } from "~/common/ui/mixins/gradient";
import { centerIcon, iconSrc } from "~/common/ui/mixins/image";
import { singleLine } from "~/common/ui/mixins/typography";

import { COLOR_PRIMARY } from "../../../constants/colors";
import { interBold } from "../../../mixins/typography";
import {
  Body,
  BodyContainer,
  WithIsOwn,
  fadeInFromBottomAnimation,
} from "../ChatEvent/style";

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const StyledActiveBlock = styled.div`
  margin: 3px;
  border-radius: 24px;
  transition: 0.15s box-shadow;
  ${gradientBorder(
    `linear-gradient(
    135deg,
    rgba(16, 135, 253, 1) 0%,
    rgba(204, 36, 234, 1) 50%,
    rgba(16, 135, 253, 1) 100%
    )`,
    3,
  )};

  &::before {
    background-size: 300% 100%;
    animation: ${gradientAnimation} 2s infinite;
    will-change: background-position;
  }
`;

export const Container = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0px 16px;
  background-color: #fff;
  border-radius: ${getInnerBorderRadius("24px", "3px")};
`;

/* ${borderShadow("rgba(0, 0, 0, 0.08)", "1px")}; */

export const TaskIcon = styled.div`
  ${size("18px")};
  ${centerIcon()};
  ${iconSrc(ICON_CUBE)};
  opacity: 0.5;
  margin-right: 4px;
  flex-shrink: 0;
`;

// export const Text = styled.div`
//   font-size: 14px;
//   padding: 0px 4px;
//   color: rgba(0, 0, 0, 0.5);
//   ${singleLine};
// `;

const fadeInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`;

const fadeOutToTop = keyframes`
  from {
    opacity: 1;
    transform: translateY(0px);
  }
  to {
    opacity: 0;
    transform: translateY(-16px);
  }
`;

const fadeAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  25% {
    opacity: 1;
    transform: translateY(0px);
  }
  75% {
    opacity: 1;
    transform: translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-16px);
  }
`;
/* animation: ${fadeOutToTop} 0.3s ease-out, ${fadeInFromBottom} 0.3s ease-out;
animation-play-state: paused; */
/* <{ isChanging: boolean }> */
export const Text = styled.div`
  ${singleLine};
  will-change: opacity, transform;
  font-size: 14px;

  & span {
    display: block;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.5);
    margin-top: 4px;
  }
`;
// animation: ${fadeAnimation} 0.3s ease-out;
// animation: ${fadeOutToTop} 0.3s ease-out,
//         ${fadeInFromBottom} 0.3s ease-out;
