import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { connected_users, playing } from "../pong.gateway";

// user must be logged in AND must not be playing a match to perform actions
export class PongGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToWs();
    const socket = ctx.getClient();
    const user_id = connected_users.get(socket);
    if (!user_id) {
      return false;
    }
    if (playing.has(user_id)) {
      return false;
    }
    return true;
  }
}
