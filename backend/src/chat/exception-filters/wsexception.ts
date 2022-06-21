import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const ctx = host.switchToWs();
		const socket = ctx.getClient();
		socket.send(JSON.stringify({
			status: 'error',
			message: exception.message
		}));
	};
}
