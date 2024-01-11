import styled, { css } from "styled-components";
import { circle, size } from "~/common/ui/mixins/box";
import { clearAnchor } from "~/common/ui/mixins/default_styles";
import { centerIcon, iconSrc } from "~/common/ui/mixins/image";
import { WithVisible } from "~/common/ui/types/state";

import { COLOR_PRIMARY, COLOR_PRIMARY_DARK } from "../../constants/colors";
import {
  interBold,
  interExtraBold,
  interMedium,
} from "../../mixins/typography";

export const StyledHomeView = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;

  a {
    ${clearAnchor};
  }
`;

export const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  font-size: 24px;
  padding: 16px 24px;
  color: #fff;
  ${interBold};
`;

export const Sections = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

export const StyledHeroSection = styled.div`
  display: flex;
  align-items: center;
  flex: 3;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgb(204, 36, 234) 0%,
    rgb(16, 135, 253) 100%
  );
`;

export const Demo = styled.div`
  padding: 0px 32px;
`;

export const DemoTitle = styled.div`
  font-size: 40px;
  ${interExtraBold};
  color: #fff;
`;

export const DemoText = styled.div`
  margin-top: 8px;
  font-size: 32px;
  ${interMedium};
  color: #fff;
`;

export const DemoBullet = styled.span<WithVisible>`
  display: inline-block;
  ${circle};
  background-color: #fff;
  vertical-align: middle;
  margin-left: 8px;
  ${size("0px")};
  transition: 0.15s ease-out width, 0.15s ease-out height;

  ${({ visible }) =>
    visible &&
    css`
      ${size("24px")};
    `}
`;

export const StyledGetStartedSection = styled.div`
  flex: 2;
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  margin-bottom: auto;
`;

export const GetStartedTitle = styled.div`
  font-size: 32px;
  ${interExtraBold};
`;

export const Buttons = styled.div`
  width: 100%;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0px 32px;

  & a {
    width: 100%;
  }
`;

export const Button = styled.div`
  width: 100%;
  padding: 16px 32px;
  border-radius: 64px;
  background-color: ${COLOR_PRIMARY};
  font-size: 16px;
  color: #fff;
  text-align: center;
  ${interBold};
  cursor: pointer;
  transition: 0.15s ease-out background-color;

  &:hover {
    background-color: ${COLOR_PRIMARY_DARK};
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 0px;
`;

export const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  ${interBold};
  font-size: 16px;
  color: rgba(0, 0, 0, 0.8);
`;

export const FooterLogoImage = styled.div`
  ${size("24px")};
  ${centerIcon()};
  ${iconSrc("/nersent_logo.png")};
  margin-right: 8px;
`;
