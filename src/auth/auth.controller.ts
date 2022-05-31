import {
	Query,
	Controller,
	Post,
	Req,
	Body,
	Res,
	Get,
	HttpCode,
	UseGuards,
	UnauthorizedException,
	UseFilters,
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	StreamableFile,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { IntraGuard } from './guards/intra.guard';
import { JwtGuard } from './guards/jwt.guard';
import { JwtTwoFactorAuthenticationGuard } from './guards/tfa.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { toFileStream } from 'qrcode';
import { UsersService } from '../users/users.service';
import { Usr } from '../users/decorators/user.decorator';
import { HtmlService } from 'src/html/html.service';

async function pipeQrCodeStream(stream: Response, otpauthUrl: string) {
	return toFileStream(stream, otpauthUrl);
}


@Controller()
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private jwtService: JwtService,
		private usersService: UsersService,
		private htmlService: HtmlService
	) {}

	@Get('login/42')
	@UseGuards(IntraGuard)
	getUserLogin(): void {}

	@Get('login/42/return')
	@UseGuards(IntraGuard)
	getUserLoggedIn(@Usr() user, @Res({ passthrough: true }) res: Response) {
		const jwtToken = this.jwtService.sign({
			id: user.id,
			username: user.username,
		});
		res.cookie('jwt_token', jwtToken);
		return res.redirect('/');
	}

	@Get('/settings/activate-2fa')
	@UseGuards(JwtGuard)
	async activateTwoFactorAuthentication(@Usr() user, @Res() res: Response) {
		const { otpauthUrl } =
			await this.authService.generateTwoFactorAuthenticationSecret(user);

		return pipeQrCodeStream(res, otpauthUrl);
	}

	@Get('/settings/deactivate-2fa')
	@UseGuards(JwtGuard)
	async deactivateTwoFactorAuthentication(@Usr() user, @Res() res: Response) {
		await this.usersService.turnOffTwoFactorAuthentication(user.id);

		return res.redirect('/login/');
	}

	@Post('/login/two-factor-authentication/')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorAuthenticationGuard)
	twoFactorAuthentication(
		@Usr() user,
		@Body() { twoFactorAuthenticationCode },
		@Res({ passthrough: true }) res: Response,
	) {
		const isTwoFactorAuthenticationCodeValid =
			this.authService.check2FACodeValidity(
				twoFactorAuthenticationCode,
				user,
			);

		if (!isTwoFactorAuthenticationCodeValid) {
			throw new UnauthorizedException('Invalid 2FA code');
		}

		const jwtToken = this.jwtService.sign({
			id: user.id,
			username: user.username,
			validTwoFactorAuthentication: true,
		});

		res.clearCookie('jwt_token');
		res.cookie('jwt_token', jwtToken);

		return res.redirect('/');
	}

	@Get('logout')
	@UseGuards(JwtGuard)
	getLogoutPage(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('jwt_token');
		return res.redirect('/login/');
	}

}
