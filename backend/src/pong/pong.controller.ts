import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { sockets } from './pong.gateway';
import { connected_users } from './pong.gateway';

@Controller('pong')
@ApiTags('pong')
@UseGuards(JwtGuard)
export class PongController {
  constructor(private usersService: UsersService) {}

  @Get('sessions')
  async getSessions() {
    let res: {
      session_id: number;
      p1: Partial<User>;
      p2: Partial<User>;
    }[] = [];
    for (let s of sockets) {
      const p1_id = connected_users.get(s.p1Socket);
      const p2_id = connected_users.get(s.p2Socket);
      const p1 = await this.usersService.findById(p1_id);
      const p2 = await this.usersService.findById(p2_id);
      res.push({
        session_id: s.id,
        p1: {
          avatarId: p1.avatarId,
          id: p1.id,
          display_name: p1.display_name,
        },
        p2: {
          avatarId: p2.avatarId,
          id: p2.id,
          display_name: p2.display_name,
        },
      });
    }
    return res;
  }
}
