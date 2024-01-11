import styled, { css } from "styled-components";
import { Image } from "~/common/ui/components/Image";
import { clearAnchor } from "~/common/ui/mixins/default_styles";

import { COLOR_PRIMARY, COLOR_PRIMARY_DARK } from "../../../constants/colors";
import { interExtraBold, interRegular } from "../../../mixins/typography";
import { Body, WithIsOwn } from "../ChatEvent/style";
import { baseTextStyle } from "../TextBlock/style";

export const StyledMarkdownBlock = styled.div`
  & p {
    margin-top: 8px;
  }

  & ol {
    padding: 0px 16px;
    margin: 0;
  }

  & pre {
    margin: 0;
    margin-top: 8px;
  }
`;

export const StyledImageRenderer = styled(Image)`
  margin-top: 8px;
`;

export const StyledCodeRenderer = styled.div`
  border-radius: 16px;
  overflow: hidden;
`;

export const CodeBlockBar = styled.div`
  padding: 8px 16px;
  background-color: #222327;
  color: #fff;
  font-size: 14px;
`;

export const StyledParagraphRenderer = styled.p`
  ${baseTextStyle}
  margin: 0px;
  color: #000;
  background-color: rgba(0, 0, 0, 0.06);

  & a {
    ${clearAnchor};
    color: ${COLOR_PRIMARY};
    transition: 0.15s color;

    &:hover {
      color: ${COLOR_PRIMARY_DARK};
    }
  }

  & strong {
    ${interExtraBold};
  }
`;
