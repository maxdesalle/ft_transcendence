import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
export declare class AuthService {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    check2FACodeValidity(twoFactorAuthenticationCode: string, user: User): boolean;
    generateTwoFactorAuthenticationSecret(user: User): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
}
