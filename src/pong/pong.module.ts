import { Module } from '@nestjs/common';
import { PongGateway, PongViewerGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongViewerGateway]
})
export class PongModule {}
