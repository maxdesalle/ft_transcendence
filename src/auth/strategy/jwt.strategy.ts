import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService, // used by super below
	) {
=======

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
>>>>>>> main
		const getJwtToken = (req: Request) => {
			let token = null;
			if (req && req.cookies) {
				token = req.cookies['jwt_token'];
				return token;
			} else {
				console.log(req);
			}
		};

		super({
			jwtFromRequest: getJwtToken,
			ignoreExpiration: false,
<<<<<<< HEAD
			secretOrKey: configService.get<string>('JWT_TOKEN_SECRET'),
=======
			secretOrKey: process.env.JWT_TOKEN_SECRET,
>>>>>>> main
		});
	}

	async validate(payload: any) {
		const user = await this.usersService.findByUsername(payload.username);

		if (user) {
			if (
				user.isTwoFactorAuthenticationEnabled == false ||
				payload.validTwoFactorAuthentication
			) {
				return user;
			}
		}
		throw new UnauthorizedException();
	}
}
