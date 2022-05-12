import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private usersService: UsersService) { // dependency injection
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: 'http://127.0.0.1:3000/login/42/return',
			scope: ['public'],
		});
	}

	async validate(accessToken, refreshToken, user): Promise<any> {
		let new_user = this.usersService.createNewUser(user.username); // add new user
		return new_user;
	}
}
