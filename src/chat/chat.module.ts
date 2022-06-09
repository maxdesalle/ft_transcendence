import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatUserController } from './chat-user.controller';
import { ChatUserService } from './chat-user.service';
import { JwtChatStrategy } from './strategy/jwt.strategy';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ChatUserController, ChatController],
  providers: [ChatUserService, JwtChatStrategy, ChatService],
  imports: [JwtModule.registerAsync(jwtConfig), UsersModule],
  exports: [ChatUserService]
})
export class ChatModule {}