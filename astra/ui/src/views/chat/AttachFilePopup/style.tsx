import { noEvents } from "@common/ui";
import styled, { css } from "styled-components";
import { ICON_ATTACH_FILE } from "~/common/ui/icons";
import { size } from "~/common/ui/mixins/box";
import { centerIcon, iconSrc } from "~/common/ui/mixins/image";
import { WithVisible } from "~/common/ui/types/state";

import { interExtraBold } from "../../../mixins/typography";

export const StyledAttachFilePopup = styled.div<WithVisible>`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1000;
  left: 0%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  display: none;

  ${({ visible: isVisible }) =>
    isVisible &&
    css`
      display: flex;
      backdrop-filter: blur(24px);
    `}
`;

export const Icon = styled.div`
  ${size("32px")};
  ${centerIcon()};
  ${iconSrc(ICON_ATTACH_FILE)};
  ${noEvents};
`;

export const Text = styled.div`
  color: #000;
  font-size: 16px;
  margin-left: 8px;
  ${interExtraBold};
  ${noEvents};
`;
