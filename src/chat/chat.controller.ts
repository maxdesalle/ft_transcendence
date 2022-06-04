import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatService } from './chat.service';
import { JwtChatGuard } from './guards/jwt.guard';

@Controller('chat')
export class ChatController {
	constructor(
		private chatService: ChatService,
		private jwtService: JwtService,
	) {}

	@Get('test')
	test() {
		return this.chatService.testDBconnection();
	}

	@Post('register')
	newChatUser(@Body('value') name: string) {
		return this.chatService.createChatUser(name);
	}

	@Post('login')
	async login(
		@Body('value') username: string,
		@Res({ passthrough: true }) res: Response
	) {
		const user = await this.chatService.getUser(username);
		if (!user)
			return "user not registered";

		const jwtToken = this.jwtService.sign({
			id: user.id,
			username: username,
		});
		res.cookie('jwt_token', jwtToken);
		return "ok?";
	}

	@Get('test_logged')
	@UseGuards(JwtChatGuard)
	testLoggedUser(@Request() req)
	{
		return req.user;
	}
}
