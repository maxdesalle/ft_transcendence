import { Query, Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IntraGuard } from './guards/intra.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
});

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

	@Get()
	getHomePage(): string {
		return this.authService.getHomePage();
	}

	@Get('/login/')
	getLoginPage(): string {
		return this.authService.getLoginPage();
	}

	@Get('/login/42')
	@UseGuards(IntraGuard)
	getUserLogin(): void {}

	@Get('/login/42/return')
	@UseGuards(IntraGuard)
	getUserLoggedIn(@User() user, @Res({ passthrough: true }) res: Response) {
		const jwt_token = this.jwtService.sign({id: user.id, username: user.username});
		res.cookie('jwt_token', jwt_token);
		const welcome = `Welcome ${user.username} 👋`;
		return welcome;
	}
}
