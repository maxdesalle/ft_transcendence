import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
declare const JwtTwoFactorStrategy_base: new (...args: any[]) => any;
export declare class JwtTwoFactorStrategy extends JwtTwoFactorStrategy_base {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    validate(payload: any): Promise<import("../../users/entities/user.entity").User>;
}
export {};
