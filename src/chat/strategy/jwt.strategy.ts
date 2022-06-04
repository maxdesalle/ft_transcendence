import { PassportStrategy } from '@nestjs/passport';
import { Injectable  } from '@nestjs/common';
import { Request  } from 'express';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ChatUserService } from '../chat-user.service';

@Injectable()
export class JwtChatStrategy extends PassportStrategy(Strategy, "chat-jwt") {
	constructor(
		private configService: ConfigService,
		private chatService: ChatUserService
	) {
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
			secretOrKey: configService.get<string>('JWT_TOKEN_SECRET'),
		});
	}

	async validate(payload: any) {
		return {id: payload.id, username: payload.username};
	}
}
