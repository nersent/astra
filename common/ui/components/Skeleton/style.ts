import styled, { keyframes } from "styled-components";

const DARK = `rgba(255, 255, 255, 0.08)`;
const LIGHT = `rgba(255, 255, 255, 0.04)`;

export const glowAnimation = keyframes`
  0% {
    background-color: ${DARK};
  }
  50% {
    background-color: ${LIGHT};
  }
  100% {
    background-color: ${DARK};
  }
`;

export const StyledSkeleton = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  animation: ${glowAnimation} 3s ease-in-out infinite;
`;
