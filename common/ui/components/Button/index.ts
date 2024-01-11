import { css } from "styled-components";

import { stdTransition } from "../../mixins/animations";
import { clearDefaultInputStyle } from "../../mixins/default-styles";
import { asVar } from "../../mixins/themes";
import { asFocusSelector, focusOutline } from "../../mixins/ux";
import {
  VAR_UI_BUTTON_BACKGROUND,
  VAR_UI_BUTTON_BORDER,
  VAR_UI_BUTTON_COLOR,
  VAR_UI_BUTTON_FOCUS_BACKGROUND,
  VAR_UI_BUTTON_FOCUS_OUTLINE,
  VAR_UI_BUTTON_HOVER_BACKGROUND,
} from "../../theme/vars";

export const buttonStyle = css`
  width: 100%;
  ${clearDefaultInputStyle};
  background-color: var(${VAR_UI_BUTTON_BACKGROUND});
  border-radius: 6px;
  border: var(${VAR_UI_BUTTON_BORDER});
  color: var(${VAR_UI_BUTTON_COLOR});
  height: 48px;
  padding: 0px 16px;
  font-size: 14px;
  transition: ${stdTransition()};
  ${focusOutline(asVar(VAR_UI_BUTTON_FOCUS_OUTLINE))};

  &:hover {
    background-color: var(${VAR_UI_BUTTON_HOVER_BACKGROUND});
  }

  ${asFocusSelector} {
    background-color: var(${VAR_UI_BUTTON_FOCUS_BACKGROUND});
  }
`;
