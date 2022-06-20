import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { PongGateway, PongViewerGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongViewerGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
  ]
})
export class PongModule {}
