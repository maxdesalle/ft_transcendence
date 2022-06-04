import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatUserService } from './chat-user.service';
import { JwtChatGuard } from './guards/jwt.guard';

@Controller('chat')
export class ChatUserController {
	constructor(
		private chatUserService: ChatUserService,
		private jwtService: JwtService,
	) {}

	@Get('users')
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

		const jwtToken = this.jwtService.sign({
			id: user.id,
			username: username,
		});
		res.cookie('jwt_token', jwtToken);
		return `logged in as ${username}`;
	}

	@Get('me')
	@UseGuards(JwtChatGuard)
	currentUser(@Request() req) {
		return req.user;
	}

	@Get('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('jwt_token');
		return ("logged out")
	}
}
