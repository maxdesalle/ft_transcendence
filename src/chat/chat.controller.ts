import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
	constructor(
		private chatService: ChatService,
	) {}

	@Get('test')
	test() {
		return this.chatService.testDBconnection();
	}

	@Post('register')
	newChatUser(@Body('value') name: string) {
		return this.chatService.createChatUser(name);
	}
}
