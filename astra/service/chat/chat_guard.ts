import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import { getUserFromExecutionCtx } from "../auth/auth_decorators";
import { NotAuthenticated } from "../auth/auth_exceptions";

import { ChatService } from "./chat_service";

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const user = getUserFromExecutionCtx(ctx);
    if (user == null) throw new NotAuthenticated();

    const chatUuid = ctx.switchToHttp().getRequest().params.chatUuid;
    const chat = await this.chatService.findChatByUuid(chatUuid);
    if (chat == null) throw new ForbiddenException();
    const canAccess = await this.chatService.canUserAccessChat(chat, user);
    if (!canAccess) throw new ForbiddenException();

    req.chat = chat;

    return true;
  }
}
