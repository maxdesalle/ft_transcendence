import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: 'http://127.0.0.1:3000/login/42/return',
			scope: ['public'],
		});
	}

	async validate(accessToken, refreshToken, user): Promise<any> {
		return user;
	}
}
