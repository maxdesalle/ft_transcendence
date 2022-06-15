import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { WsService } from './ws.service';

@Module({
  providers: [WsService],
  exports: [WsService],
  imports: [JwtModule.registerAsync(jwtConfig)],
})
export class WebsocketsModule {}
