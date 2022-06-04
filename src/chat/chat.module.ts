import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatUserController } from './chat-user.controller';
import { ChatUserService } from './chat-user.service';
import { JwtChatStrategy } from './strategy/jwt.strategy';

@Module({
  controllers: [ChatUserController],
  providers: [ChatUserService, JwtChatStrategy],
  imports: [JwtModule.registerAsync(jwtConfig)],
  exports: [ChatUserService]
})
export class ChatModule {}