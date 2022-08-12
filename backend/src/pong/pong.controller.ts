import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { sockets } from './pong.gateway';

@Controller('pong')
@ApiTags('pong')
export class PongController {
  @Get('sessions')
  getSessions() {
    return sockets.map((ob) => ob.id);
  }
}
