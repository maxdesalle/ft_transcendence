import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService // used by super below
	) {
		super({
			clientID: configService.get<string>('FORTYTWO_CLIENT_ID'),
			clientSecret: configService.get<string>('FORTYTWO_CLIENT_SECRET'),
			callbackURL: configService.get<string>('FORTYTWO_CALLBACK_URL'),
			scope: ['public'],
		});
	}

	async validate(accessToken, refreshToken, user): Promise<any> {
<<<<<<< HEAD
		const new_user = this.usersService.createNewUser(user.username);
=======
		let new_user = this.usersService.createNewUser(user.username); // add new user
>>>>>>> main
		return new_user;
	}
}
