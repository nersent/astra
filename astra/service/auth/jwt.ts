import { Injectable } from "@nestjs/common";
import {
  JsonWebTokenError,
  JwtHeader,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

import { ConfigService } from "../config_service";

import { JwtExpiredException, JwtInvalidException } from "./auth_exceptions";

export interface JwtOptions {
  expirationTime: number;
}

export interface JwtDecoded<T> {
  header: JwtHeader;
  payload: T;
  signature: string;
}

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  public async createToken<T extends Record<string, any>>(
    payload: T,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      (sign as any)(
        payload,
        this.configService.jwtSecret,
        {
          expiresIn: this.configService.jwtExpirationTime,
        },
        (err: any, token: string) => {
          if (err) return reject(err);
          if (token == null) return reject("Created token is empty");
          return resolve(token);
        },
      );
    });
  }

  public async decodeToken<T extends Record<string, any>>(
    token: string,
  ): Promise<JwtDecoded<T>> {
    return new Promise<JwtDecoded<T>>((resolve, reject) => {
      verify(
        token,
        this.configService.jwtSecret,
        { complete: true, maxAge: this.configService.jwtExpirationTime },
        (err: any, decoded: any) => {
          if (err instanceof TokenExpiredError) {
            return reject(new JwtExpiredException());
          }
          if (err instanceof JsonWebTokenError) {
            return reject(new JwtInvalidException());
          }
          if (err) return reject(err);
          if (decoded == null) return reject("Decoded token is empty");
          return resolve(decoded);
        },
      );
    });
  }
}
