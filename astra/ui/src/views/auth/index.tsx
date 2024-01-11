import { AuthSection } from "./AuthSection";
import { StyledAuthView } from "./style";

export type AuthViewProps = React.HTMLAttributes<HTMLDivElement> & {
  login?: boolean;
};

export const AuthView = ({ ...props }: AuthViewProps) => {
  return (
    <StyledAuthView {...props}>
      <AuthSection login={props.login} />
    </StyledAuthView>
  );
};
