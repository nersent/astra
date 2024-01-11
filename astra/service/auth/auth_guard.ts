import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { NotAuthenticated } from "./auth_exceptions";
import { AuthService } from "./auth_service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = await this.authService.tryHandleJwtReq(req);
    if (user == null) throw new NotAuthenticated();
    req.user = user;
    return true;
  }
}
