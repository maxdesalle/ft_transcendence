import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
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
			secretOrKey: process.env.JWT_TOKEN_SECRET,
		});
	}

	async validate(payload: any) {
		const user = await this.usersService.findByUsername(payload.username);

		if (user) {
			return user;
		} else {
			throw new UnauthorizedException();
		}
	}
}
