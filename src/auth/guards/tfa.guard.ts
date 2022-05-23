import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export class JwtTwoFactorAuthenticationGuard extends AuthGuard('jwt-two-factor') {}
