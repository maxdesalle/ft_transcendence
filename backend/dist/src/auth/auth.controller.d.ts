import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Login2faDTO } from './dto/login2FA.dto';
export declare class AuthController {
    private readonly authService;
    private jwtService;
    private usersService;
    constructor(authService: AuthService, jwtService: JwtService, usersService: UsersService);
    getUserLogin(): void;
    getUserLoggedIn(user: any, res: Response): void;
    activateTwoFactorAuthentication(user: any, res: Response): Promise<any>;
    deactivateTwoFactorAuthentication(user: any, res: Response): Promise<void>;
    twoFactorAuthentication(user: any, { twoFactorAuthenticationCode }: Login2faDTO, res: Response): void;
    getLogoutPage(res: Response): void;
}
