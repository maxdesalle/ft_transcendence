import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtChatGuard extends AuthGuard('chat-jwt') {}
