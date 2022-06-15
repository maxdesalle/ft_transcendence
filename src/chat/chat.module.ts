import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';
import { WsGateway } from '../websockets/ws.gateway';
import { WsService } from '../websockets/ws.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, WsGateway, WsService],
  imports: [JwtModule.registerAsync(jwtConfig), UsersModule],
  exports:[WsService]
})
export class ChatModule {}