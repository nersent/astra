import styled, { css } from "styled-components";

import { centerIcon } from "../../mixins/image";

export const ICON_URL_VAR_NAME = "--ui-icon-url";
export const VAR_ICON_SIZE = "--ui-icon-size";
export const VAR_ICON_COLOR = "--ui-icon-color";

export const StyledIcon = styled.div`
  ${({ useMask }: { useMask?: boolean }) =>
    useMask
      ? css`
          -webkit-mask-image: var(${ICON_URL_VAR_NAME});
          ${centerIcon(`var(${VAR_ICON_SIZE})`, true)};
        `
      : css`
          background-image: var(${ICON_URL_VAR_NAME});
          background-color: var(${VAR_ICON_COLOR});
          ${centerIcon(`var(${VAR_ICON_SIZE})`)};
        `}
`;
