import styled from "styled-components";

export const VAR_FORM_CONTROL_LABEL_SPACING = "--ui-form-control-label-spacing";
export const VAR_DEF_FORM_CONTROL_LABEL_SPACING = "8px";

export const FormControl = styled.div`
  display: flex;
  flex-direction: column;

  &:first-child {
    margin-bottom: var(
      ${VAR_FORM_CONTROL_LABEL_SPACING},
      ${VAR_DEF_FORM_CONTROL_LABEL_SPACING}
    );
  }
`;
