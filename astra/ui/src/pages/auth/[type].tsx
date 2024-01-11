import { useRouter } from "next/router";

import { AuthView } from "../../views/auth";

export function Auth() {
  const router = useRouter();
  const { type } = router.query;
  const login = type == null || type === "login";

  return <AuthView login={login} />;
}

export default Auth;
