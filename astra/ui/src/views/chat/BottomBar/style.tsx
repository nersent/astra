import styled, { css } from "styled-components";
import { FOCUS_OUTLINE_DARK } from "~/common/ui/constants/colors";
import { ICON_CLOSE, ICON_STOP_CIRCLE } from "~/common/ui/icons";
import { stdTransition } from "~/common/ui/mixins/animations";
import { borderShadow, circle, size } from "~/common/ui/mixins/box";
import {
  clearFocusOutline,
  clearInput,
} from "~/common/ui/mixins/default_styles";
import { centerIcon, iconSrc, invert } from "~/common/ui/mixins/image";
import { singleLine } from "~/common/ui/mixins/typography";
import {
  hidden,
  noEvents,
  noUserDrag,
  noUserSelect,
  visible,
} from "~/common/ui/mixins/ux";
import { WithDisabled } from "~/common/ui/types/state";

export const StyledBottomBar = styled.div`
  width: 100%;
  padding: 16px 8px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  position: relative;
  align-items: center;
  z-index: 2;
  width: 100%;
`;

export const TextInput = styled.input`
  width: 100%;
  height: 52px;
  ${clearInput};
  font-size: inherit;
  resize: none;
  font-family: inherit;
  padding: 0px 24px;
`;

export const StyledInput = styled.div`
  width: 100%;
  height: auto;
  font-size: 16px;
  border-radius: 32px;
  margin: 0px 8px;
  background-color: rgba(0, 0, 0, 0.04);
  transition: 0.15s background-color, 0.15s box-shadow;
  flex: 1;

  &:not(:active):not(:focus):not(:focus-within):hover {
    ${borderShadow("rgba(0, 0, 0, 0.24)", "2px")};
  }

  &:focus,
  &:active,
  &:focus-within {
    ${borderShadow(FOCUS_OUTLINE_DARK, "2px")};
  }
`;

export const Attachments = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px;
  margin-bottom: 0px;
`;

export const FileIconContainer = styled.div`
  position: relative;
  ${size("16px")};
  margin-right: 8px;
`;

export const RemoveAttachedFileIcon = styled.div`
  position: absolute;
  right: -8px;
  top: -8px;
  ${size("24px")};
  border: 1px solid #000;
  ${circle};
  ${hidden};
  transition: 0.15s background-color, 0.15s opacity;

  &::before {
    display: block;
    content: "";
    ${size("100%")};
    ${centerIcon("16px")};
    ${iconSrc(ICON_CLOSE)};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.24);
  }
`;

export const StyledAttachedFile = styled.div`
  height: 40px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.08);
  padding: 0px 16px;
  font-size: 14px;
  position: relative;
  display: flex;
  align-items: center;

  & span {
    ${singleLine};
  }

  &:hover ${RemoveAttachedFileIcon} {
    ${visible};
  }
`;

export interface ActionButtonProps extends WithDisabled {
  iconSrc: string;
}

export const ActionButton = styled.div<ActionButtonProps>`
  ${size("48px")};
  flex-shrink: 0;
  transition: 0.15s background-color;
  border-radius: 100%;
  ${noUserSelect};
  ${noUserDrag};

  &::before {
    content: "";
    display: block;
    ${size("100%")};
    ${centerIcon("24px")};
    ${(props) => iconSrc(props.iconSrc)};
    opacity: 0.7;
    transition: 0.15s opacity;
  }

  ${({ disabled }) =>
    !disabled
      ? css`
          &:hover {
            background-color: rgba(0, 0, 0, 0.08);
          }

          &:focus,
          &:active {
            background-color: rgba(0, 0, 0, 0.16);
          }
        `
      : css`
          &::before {
            opacity: 0.3;
          }
          ${noEvents};
        `}
`;
