import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
declare const IntraStrategy_base: new (...args: any[]) => any;
export declare class IntraStrategy extends IntraStrategy_base {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    validate(accessToken: any, refreshToken: any, user: any): Promise<any>;
}
export {};
