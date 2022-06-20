import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { WsModule } from 'src/ws/ws.module';
import { PongGateway, PongViewerGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongViewerGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
    UsersModule,
		forwardRef(() => WsModule) 
  ]
})
export class PongModule {}
