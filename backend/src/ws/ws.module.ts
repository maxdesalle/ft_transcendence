import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from 'src/chat/chat.service';
import { jwtConfig } from 'src/config/jwt.config';
import { FriendsModule } from 'src/friends/friends.module';
import { UsersModule } from 'src/users/users.module';
import { WsGateway } from './ws.gateway';
import { WsService } from './ws.service';

@Module({
  providers: [WsService, WsGateway, ChatService],
  exports: [WsService],
  imports: [
    JwtModule.registerAsync(jwtConfig),
    forwardRef(() => FriendsModule),
    forwardRef(() => UsersModule),
  ],
})
export class WsModule {}
