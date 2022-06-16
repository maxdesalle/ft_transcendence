import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { WsGateway } from './ws.gateway';
import { WsService } from './ws.service';

@Module({
  providers: [WsService, WsGateway],
  exports: [WsService],
  imports: [JwtModule.registerAsync(jwtConfig)],
})
export class WebsocketsModule {}
