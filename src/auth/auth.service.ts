import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService,
	) {}

	check2FACodeValidity(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.login42,
			// this.configService.get('Transcendence'),
			this.configService.get<string>('TWOFA_ISSUER'),
			secret,
		);

		await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

		await this.usersService.turnOnTwoFactorAuthentication(user.id);
		return { secret, otpauthUrl };
	}

}
