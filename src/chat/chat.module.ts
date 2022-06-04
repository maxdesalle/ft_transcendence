import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtChatStrategy } from './strategy/jwt.strategy';

@Module({
  controllers: [ChatController],
  providers: [ChatService, JwtChatStrategy],
  imports: [JwtModule.registerAsync(jwtConfig)],
  exports: [ChatService]
})
export class ChatModule {}