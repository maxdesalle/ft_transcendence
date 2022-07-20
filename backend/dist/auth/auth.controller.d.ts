import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Login2faDTO } from './dto/login2FA.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
export declare class AuthController {
    private configService;
    private readonly authService;
    private jwtService;
    private usersService;
    constructor(configService: ConfigService, authService: AuthService, jwtService: JwtService, usersService: UsersService);
    getUserLogin(): void;
    getUserLoggedIn(user: User, res: Response): void;
    activateTwoFactorAuthentication(user: any, res: Response): Promise<Response<any, Record<string, any>>>;
    deactivateTwoFactorAuthentication(user: any, res: Response): Promise<Response<any, Record<string, any>>>;
    twoFactorAuthentication(user: any, { twoFactorAuthenticationCode }: Login2faDTO, res: Response): {
        success: boolean;
    };
    getLogoutPage(res: Response): void;
}
