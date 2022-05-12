import { Query, Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IntraGuard } from './guards/intra.guard';
import { AuthService } from './auth.service';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
});

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get()
	getHomePage(): string {
		return this.authService.getHomePage();
	}

	@Get('/login/')
	getLoginPage(): string {
		return this.authService.getLoginPage();
	}

	@Get('/login?')
	getErrorLoginPage(@Query('error') error: string) {
		return this.authService.getErrorLoginPage(
			'A user with this username already exists',
		);
	}

	@Get('/login/42')
	@UseGuards(IntraGuard)
	getUserLogin(): void {
		console.log('test');
	}

	@Get('/login/42/return')
	@UseGuards(IntraGuard)
	getUserLoggedIn(@User() user, @Res({ passthrough: true }) res: Response) {
		const welcome = `Welcome ${user.username} 👋`;
		return welcome;
	}
}
