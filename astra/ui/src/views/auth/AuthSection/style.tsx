import {
  VAR_UI_BUTTON_BACKGROUND,
  VAR_UI_BUTTON_FOCUS_BACKGROUND,
  VAR_UI_BUTTON_HOVER_BACKGROUND,
  WithActive,
  buttonStyle,
  centerHorizontal,
  noUserSelect,
  upperCase,
  vars,
} from "@common/ui";
import styled, { css } from "styled-components";

import { COLOR_PRIMARY, COLOR_PRIMARY_DARK } from "../../../constants/colors";
import {
  interBold,
  interExtraBold,
  interMedium,
  interRegular,
} from "../../../mixins/typography";

export const StyledAuthSection = styled.div`
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 24px;
`;

export const StyledForm = styled.form`
  width: 100%;
  max-width: 512px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  padding: 32px;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  position: relative;
`;

export const FormHeader = styled.div`
  font-size: 16px;
  ${interBold};
`;

export const Input = styled.input`
  margin-top: 8px;
  height: 48px;
  font-size: 14px;
  ${interRegular};
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 0px 24px;

  &:focus {
    outline: 1px solid black;
  }
`;

export const Label = styled.div<{ error?: boolean }>`
  margin-top: 24px;
  font-size: 14px;
  ${interBold};

  ${({ error }) =>
    error &&
    css`
      color: red;
    `}
`;

export const SubmitButton = styled.input`
  margin-top: 32px;
  font-size: 14px ${buttonStyle};
  color: #fff;
  background-color: ${COLOR_PRIMARY} !important;
  border-radius: 8px;
  padding: 0px 24px;
  ${interExtraBold};

  &:hover {
    background-color: ${COLOR_PRIMARY_DARK};
  }

  &:focus {
    outline: 2px solid black;
  }
`;

export const Tabs = styled.div`
  border-radius: 8px;
  display: flex;
  background-color: rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  user-select: none;
  color: white;
`;

export const Tab = styled.div<WithActive>`
  padding: 10px 16px;
  border-radius: 6px;
  flex: 1;
  text-align: center;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.54);
  ${interBold}
  margin: 4px;

  &:hover {
    color: #000;
  }

  ${({ active }) =>
    active &&
    css`
      background-color: white !important;
      color: black;
      cursor: default;

      &:hover {
        color: black;
      }
    `}
`;

export const ActionLabelsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  ${noUserSelect};
`;

export const ActionLabel = styled.div`
  color: ${COLOR_PRIMARY};
  font-size: 14px;
  cursor: pointer;
  ${interBold};
`;

export const Error = styled.div`
  margin: 0 auto;
  margin-top: 16px;
  color: red;
  font-size: 14px;
  ${interBold};
`;
