import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService, // used by super below
  ) {
    const getJwtToken = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies["jwt_token"];
        return token;
      } else {
      }
    };

    super({
      jwtFromRequest: getJwtToken,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_TOKEN_SECRET"),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByLogin42(payload.login42);

    if (user) {
      if (
        user.isTwoFactorAuthenticationEnabled == false ||
        payload.validTwoFactorAuthentication
      ) {
        return user;
      }
    }
    throw new UnauthorizedException();
  }
}
