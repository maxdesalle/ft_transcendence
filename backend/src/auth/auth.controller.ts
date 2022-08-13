import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  HttpCode,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { IntraGuard } from './guards/intra.guard';
import { JwtGuard } from './guards/jwt.guard';
import { JwtTwoFactorAuthenticationGuard } from './guards/tfa.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { toFileStream } from 'qrcode';
import { UsersService } from '../users/users.service';
import { Usr } from '../users/decorators/user.decorator';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Login2faDTO } from './dto/login2FA.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

async function pipeQrCodeStream(stream: Response, otpauthUrl: string) {
  return toFileStream(stream, otpauthUrl);
}

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @Get('login/42')
  @UseGuards(IntraGuard)
  getUserLogin(): void {}

  @Get('login/42/return')
  @UseGuards(IntraGuard)
  getUserLoggedIn(
    @Usr() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtToken = this.jwtService.sign({
      id: user.id,
      login42: user.login42,
    });
    res.cookie('jwt_token', jwtToken);
    if (user.isTwoFactorAuthenticationEnabled) {
      console.log('2fa activated');
      return res.redirect(
        `${this.configService.get<string>('FRONTEND_URL')}/2fa`,
      );
    }
    return res.redirect(
      this.configService.get<string>('FRONTEND_URL') + '/matchmaking',
    );
  }

  @Get('/settings/activate-2fa')
  @UseGuards(JwtGuard)
  async activateTwoFactorAuthentication(@Usr() user, @Res() res: Response) {
    const { otpauthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(user);

    return res.send(JSON.stringify({ otpauthUrl: otpauthUrl }));
  }

  @Get('/settings/deactivate-2fa')
  @UseGuards(JwtGuard)
  async deactivateTwoFactorAuthentication(@Usr() user, @Res() res: Response) {
    await this.usersService.turnOffTwoFactorAuthentication(user.id);

    return res.send({ user });
    // return res.redirect(
    //   `${this.configService.get<string>('FRONTEND_URL')}/login`,
    // );
  }

  @Post('/login/two-factor-authentication/')
  @HttpCode(200)
  @UseGuards(JwtTwoFactorAuthenticationGuard)
  @ApiHeader({
    name: 'Cookie',
    description: 'a cookie with a valid jwt-token must be included',
  })
  twoFactorAuthentication(
    @Usr() user,
    @Body() { twoFactorAuthenticationCode }: Login2faDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isTwoFactorAuthenticationCodeValid =
      this.authService.check2FACodeValidity(twoFactorAuthenticationCode, user);

    if (!isTwoFactorAuthenticationCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const jwtToken = this.jwtService.sign({
      id: user.id,
      login42: user.login42,
      validTwoFactorAuthentication: true,
    });

    res.clearCookie('jwt_token');
    res.cookie('jwt_token', jwtToken);

    return { success: true };
  }

  @Get('logout')
  @UseGuards(JwtGuard)
  getLogoutPage(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt_token');
    return res.redirect(
      `${this.configService.get<string>('FRONTEND_URL')}/login`,
    );
  }
}
