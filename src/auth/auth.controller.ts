import {
	Query,
	Controller,
	Req,
	Res,
	Get,
	UseGuards,
	createParamDecorator,
	ExecutionContext,
	UnauthorizedException,
	UseFilters,
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { IntraGuard } from './guards/intra.guard';
import { JwtGuard } from './guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
});

@Catch(UnauthorizedException)
export class ViewAuthFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/login');
	}
}

@Controller()
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private jwtService: JwtService,
		private usersService: UsersService,
	) {}

	@Get()
	@UseFilters(ViewAuthFilter)
	@UseGuards(JwtGuard)
	async getHomePage(@User() user): Promise<string> {
		const user_object = await this.usersService.findById(user.id);
		return this.authService.getHomePage(user_object.username);
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
		const jwt_token = this.jwtService.sign({
			id: user.id,
			username: user.username,
		});
		res.cookie('jwt_token', jwt_token);
		return res.redirect('/');
	}

	@Get('/logout/')
	@UseGuards(JwtGuard)
	getLogoutPage(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('jwt_token');
		return res.redirect('/login/');
	}
}
