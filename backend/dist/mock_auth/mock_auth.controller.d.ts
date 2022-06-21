import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './DTO/login.dto';
export declare class MockAuthController {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    getUserLoggedIn(res: Response, login42: string, _body: LoginDTO): Promise<string>;
    logout(res: Response): string;
}
