import { Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';
import { Strategy } from 'passport-42';
import { IntraGuard } from './guards/intra.guard';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
	(data: any, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();
		return req.user;
	},
);

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHomePage(): string {
		return this.appService.getHomePage();
	}

	@Get('/login/42')
	@UseGuards(IntraGuard)
	getUserLogin(): void {
		console.log('test');
	}

	@Get('/login/42/return')
	@UseGuards(IntraGuard)
	getUserLoggedIn(
		@User() user,
		@Res({ passthrough: true }) res: Response,
	) {
		const welcome = `Welcome ${user.username} 👋`
		return welcome;
	}
}
