import { Body, Controller, Post, UseGuards} from '@nestjs/common';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatService } from './chat.service';
import { Session } from './DTO/chat-user.dto';
import { JwtChatGuard } from './guards/jwt.guard';

@Controller('chat')
@UseGuards(JwtChatGuard)
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Post('select')
	select_room(@Usr() user: Session, @Body('value') room_id: number) {
		this.chatService.on_select(user, room_id, true);
		console.log(user);
	}
}
