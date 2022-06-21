import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { HtmlService } from './html.service';
export declare class ViewAuthFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
export declare class HtmlController {
    private usersService;
    private htmlService;
    constructor(usersService: UsersService, htmlService: HtmlService);
    getHomePage(user: any): Promise<string>;
    getLoginPage(): string;
    getSettingsPage(): string;
    uploadAvatar(): string;
}
