import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';
import { WsGateway } from '../websockets/ws.gateway';
import { WsService } from '../websockets/ws.service';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService, WsGateway, WsService],
  imports: [JwtModule.registerAsync(jwtConfig), UsersModule, WebsocketsModule],
  exports:[WsService]
})
export class ChatModule {}