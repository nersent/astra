import styled, { css, keyframes } from "styled-components";
import { ICON_CUBE } from "~/common/ui/icons";
import { size } from "~/common/ui/mixins/box";
import { centerIcon, iconSrc } from "~/common/ui/mixins/image";
import { singleLine } from "~/common/ui/mixins/typography";
import { noUserDrag, noUserSelect } from "~/common/ui/mixins/ux";

import { Body, WithIsOwn } from "../ChatEvent/style";

export const StyledMediaBlock = styled.div`
  overflow: hidden;
  display: flex;
  ${noUserSelect};
  ${noUserDrag};

  & img {
    object-fit: contain;
    cursor: pointer;
    width: 100%;
    border-radius: 24px;
  }
`;
