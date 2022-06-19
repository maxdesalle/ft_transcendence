import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { PongGateway, PongViewerGateway, TestGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongViewerGateway, TestGateway],
  imports: [
    JwtModule.registerAsync(jwtConfig),
  ]
})
export class PongModule {}
