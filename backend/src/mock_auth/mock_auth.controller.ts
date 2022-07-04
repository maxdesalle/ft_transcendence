import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './DTO/login.dto';

@Controller('mock-auth')
@ApiTags('mock-auth')
@UseInterceptors(ClassSerializerInterceptor)
export class MockAuthController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // @Post('register')
  // addUser(@Body('username') username: string) {
  // 	return this.usersService.createNewUser(username);
  // }

  @Post('login')
  async getUserLoggedIn(
    @Res({ passthrough: true }) res: Response,
    @Body('login42') login42: string,
    @Body() _body: LoginDTO,
  ) {
    const user: User = await this.usersService.createNewUser(login42);
    const jwtToken = this.jwtService.sign({
      id: user.id,
      login42: user.login42,
    });
    res.cookie('jwt_token', jwtToken);
    return `Logged in as ${user.login42} (user_id ${user.id})`;
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt_token');
    return `Logged out`;
  }

  // @Get('jwt_info')
  // @UseGuards(JwtGuard)
  // jwt_info(
  // 	@Usr() user: User
  // ) {
  // 	return user;
  // }
}
