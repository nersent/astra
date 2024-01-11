import styled, { css } from "styled-components";

import { noUserDrag, noUserSelect } from "../../mixins";
import { WithDraggable, WithLoaded } from "../../types";

export const ImageContainer = styled.div<WithDraggable>`
  position: relative;
  overflow: hidden;

  ${({ draggable }) =>
    !draggable &&
    css`
      ${noUserSelect};
      ${noUserDrag};
    `}
`;

export const StyledImage = styled.img<WithLoaded>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  visibility: hidden;

  ${({ loaded }) =>
    loaded &&
    css`
      visibility: visible;
    `}
`;
