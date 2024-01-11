import { getTimeZone } from "@common/js";
import axios, { Axios } from "axios";
import { observer } from "mobx-react";
import Router, { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";

import { AUTH_ROUTE } from "../../../constants/routes";
import { useStore } from "../../../store/app_store_provider";

import {
  StyledForm,
  StyledAuthSection,
  Input,
  SubmitButton,
  Error,
  Label,
  Tabs,
  Tab,
} from "./style";

interface Props {
  login?: boolean;
}

export const AuthForm = observer(({ login }: Props) => {
  const store = useStore();
  const [isLogin, setIsLogin] = useState(login ?? false);
  const header = isLogin ? "Log In" : "Sign Up";
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);

  const setTab = useCallback((login: boolean) => {
    setIsLogin(login);
    setError(undefined);
  }, []);

  const onSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();

      const email = emailRef.current?.value;
      const password = passwordRef.current?.value;
      const date = dateRef.current?.value;
      if (email == null || password == null) return;
      const confirmPassword = confirmPasswordRef.current?.value;

      if (!isLogin && date?.trim() === "") {
        setError("Birth date is required");
        return;
      }

      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        if (isLogin) {
          await store.api.login({ email, password });
        } else {
          await store.api.register({
            email,
            password,
          });
        }
        const { redirect } = router.query;
        if (redirect != null) {
          Router.push(redirect as string);
          return;
        }
        if (router.pathname !== AUTH_ROUTE) {
          Router.reload();
          return;
        }
        Router.push("/");
      } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
          const errorMessage = (error.response?.data as any)?.message;
          let msg = `Something went wrong`;
          if (Array.isArray(errorMessage)) {
            msg = errorMessage.join("<br />");
          } else if (typeof errorMessage === "string") {
            msg = errorMessage;
          }
          setError(msg);
        }
      }
    },
    [isLogin],
  );

  return (
    <StyledForm onSubmit={onSubmit}>
      <Tabs>
        <Tab onClick={() => setTab(true)} active={isLogin}>
          Log In
        </Tab>
        <Tab onClick={() => setTab(false)} active={!isLogin}>
          Sign Up
        </Tab>
      </Tabs>
      <Label>Email</Label>
      <Input ref={emailRef} type="email" />
      <Label>Password</Label>
      <Input ref={passwordRef} type="password" />
      {!isLogin && (
        <>
          <Label>Confirm Password</Label>
          <Input ref={confirmPasswordRef} type="password" />
        </>
      )}
      {error != null && <Error dangerouslySetInnerHTML={{ __html: error }} />}
      <SubmitButton type="submit" value={header}></SubmitButton>
    </StyledForm>
  );
});

export const AuthSection = ({ login }: Props) => {
  return (
    <StyledAuthSection>
      <AuthForm login={login} />
    </StyledAuthSection>
  );
};
