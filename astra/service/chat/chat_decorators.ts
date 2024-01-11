import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { ChatEntity } from "./chat_entity";

export const getChatFromExecutionCtx = (ctx: ExecutionContext): ChatEntity => {
  const request = ctx.switchToHttp().getRequest();
  return request.chat as ChatEntity;
};

export const Chat = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getChatFromExecutionCtx(ctx);
  },
);
