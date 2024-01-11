import styled from "styled-components";
import { ICON_ACCOUNT_CIRCLE, ICON_EDIT_SQUARE } from "~/common/ui/icons";
import { size } from "~/common/ui/mixins/box";
import { centerIcon, iconSrc } from "~/common/ui/mixins/image";
import { customScroll } from "~/common/ui/mixins/scroll";
import { noUserSelect } from "~/common/ui/mixins/ux";

import { interBold, interMedium, singleLine } from "../../../mixins/typography";

export const StyledNavbar = styled.div`
  width: 256px;
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.04);
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  padding: 8px 0px;
  ${noUserSelect};
`;

export const StyledItem = styled.div`
  padding: 12px 8px;
  width: calc(100% - 16px);
  border-radius: 8px;
  margin: 0 auto;
  color: #000;
  display: flex;
  align-items: center;
  transition: 0.15s background-color;

  & span {
    ${singleLine};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:focus,
  &:active {
    background-color: rgba(0, 0, 0, 0.16);
  }
`;

export const Header = styled(StyledItem)`
  margin-bottom: 4px;
  ${interBold};
  font-size: 16px;
`;

export const AddIcon = styled.div`
  ${size("16px")};
  ${centerIcon()};
  ${iconSrc(ICON_EDIT_SQUARE)};
  margin-left: auto;
  margin-right: 4px;
  opacity: 0.5;
`;

export const HeaderLogoImage = styled.div`
  ${size("32px")};
  ${centerIcon()};
  ${iconSrc("/logo.png")};
  margin-right: 4px;
`;

export const ChatsLabel = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
`;

export const Chats = styled.div`
  overflow-y: auto;
  ${customScroll({
    size: "6px",
    borderRadius: "0px",
    alwaysVisible: false,
    color: "rgba(0, 0, 0, 0.16)",
    hoverColor: "rgba(0, 0, 0, 0.38)",
    activeColor: "rgba(0, 0, 0, 0.52)",
  })};
`;

export const Footer = styled.div`
  padding-top: 16px;
  margin-top: auto;
`;

export const UserProfileButton = styled(StyledItem)``;

export const UserIcon = styled.div`
  ${size("24px")};
  ${centerIcon()};
  ${iconSrc(ICON_ACCOUNT_CIRCLE)};
  margin-right: 8px;
  opacity: 0.5;
`;
