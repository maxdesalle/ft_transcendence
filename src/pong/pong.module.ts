import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { PongGateway, PongViewerGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongViewerGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
    UsersModule
  ]
})
export class PongModule {}
