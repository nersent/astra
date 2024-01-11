import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { throwIfEmpty } from "~/common/js/assert";

import { UserEntity } from "../user/user_entity";

export const getUserFromExecutionCtx = (ctx: ExecutionContext): UserEntity => {
  const request = ctx.switchToHttp().getRequest();
  return throwIfEmpty(request.user as UserEntity, "Could not find user");
};

export const SessionUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getUserFromExecutionCtx(ctx);
  },
);
