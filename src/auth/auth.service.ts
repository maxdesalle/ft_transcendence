import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	check2FACodeValidity(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			// this.configService.get('Transcendence'),
			'Transcendence',
			secret,
		);

		await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

		await this.usersService.turnOnTwoFactorAuthentication(user.id);
		return { secret, otpauthUrl };
	}

}
