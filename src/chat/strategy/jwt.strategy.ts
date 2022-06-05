import { PassportStrategy } from '@nestjs/passport';
import { Injectable  } from '@nestjs/common';
import { Request  } from 'express';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ChatUserService } from '../chat-user.service';
import { userJwtPayload } from '../DTO/chat-user.dto';

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

	async validate(payload: any): Promise<userJwtPayload> {
		const {iat, exp, ...user} = payload;
		return user;
	}
}
