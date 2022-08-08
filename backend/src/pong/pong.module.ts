import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { StatsModule } from 'src/stats/stats.module';
import { StatsService } from 'src/stats/stats.service';
import { UsersModule } from 'src/users/users.module';
import { WsModule } from 'src/ws/ws.module';
import { PongGateway, PongViewerGateway } from './pong.gateway';
import { PongController } from './pong.controller';

@Module({
  providers: [PongGateway, PongViewerGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
    UsersModule,
		forwardRef(() => WsModule),
    StatsModule
  ],
  controllers: [PongController]
})
export class PongModule {}
