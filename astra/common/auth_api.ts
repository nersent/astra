import { IsDate, IsEmail, IsString, Matches } from "class-validator";

import { JwtToken } from "./auth";

export class AuthLoginRequest {
  @IsString()
  email!: string;

  @IsString()
  password!: string;
}

export interface AuthLoginResponse {
  token: JwtToken;
}

export class AuthRegisterRequest {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/, {
    message:
      "Password must contain at least 8 characters, one letter and one number",
  })
  password!: string;
}

export interface AuthRegisterResponse {
  token: JwtToken;
}
