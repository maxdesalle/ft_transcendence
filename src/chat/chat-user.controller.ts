import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatUserService } from './chat-user.service';
import { userJwtPayload, Session } from './DTO/chat-user.dto';
import { JwtChatGuard } from './guards/jwt.guard';

@Controller('chat_user')
export class ChatUserController {
	constructor(
		private chatUserService: ChatUserService,
		private jwtService: JwtService,
	) {}

	@Get('all')
	test() {
		return this.chatUserService.getAll();
	}

	@Post('register')
	newChatUser(@Body('value') name: string) {
		return this.chatUserService.createChatUser(name);
	}

	@Post('login')
	async login(
		@Body('value') username: string,
		@Res({ passthrough: true }) res: Response
	) {
		const user = await this.chatUserService.getUser(username);
		if (!user)
			return "user not registered";
		const payload: userJwtPayload = {
			id: user.id,
			username,
			selected_room: 0,
		}
		const jwtToken = this.jwtService.sign(payload);
		res.cookie('jwt_token', jwtToken);
		return `logged in as ${username}`;
	}

	@Get('my_session')
	@UseGuards(JwtChatGuard)
	currentUser(@Usr() user: userJwtPayload): userJwtPayload {
		return user;
	}

	@Get('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('jwt_token');
		return ("logged out")
	}

}
