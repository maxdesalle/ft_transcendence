import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { WsAuthService } from './ws-auth.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthService],
  imports: [JwtModule.registerAsync(jwtConfig), UsersModule],
})
export class ChatModule {}