import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super("Invalid credentials provided", HttpStatus.BAD_REQUEST);
  }
}

export class EmailAlreadyExists extends HttpException {
  constructor() {
    super("Email already exists", HttpStatus.BAD_REQUEST);
  }
}

export class JwtExpiredException extends HttpException {
  constructor() {
    super("Token has expired", HttpStatus.UNAUTHORIZED);
  }
}

export class JwtInvalidException extends HttpException {
  constructor() {
    super("Token is invalid", HttpStatus.BAD_REQUEST);
  }
}

export class ApiKeyInvalidException extends HttpException {
  constructor() {
    super("Api key is invalid", HttpStatus.BAD_REQUEST);
  }
}

export class NotAuthenticated extends HttpException {
  constructor() {
    super("Not authenticated", HttpStatus.UNAUTHORIZED);
  }
}
