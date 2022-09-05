import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { StatsModule } from 'src/stats/stats.module';
import { UsersModule } from 'src/users/users.module';
import { WsModule } from 'src/ws/ws.module';
import { PongGateway, PongViewerGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  providers: [PongGateway, PongViewerGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
    UsersModule,
    FriendsModule,
    forwardRef(() => WsModule),
    StatsModule,
  ],
  controllers: [PongController],
})
export class PongModule {}
