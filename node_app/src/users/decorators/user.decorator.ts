import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Usr = createParamDecorator((data: any, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
});
