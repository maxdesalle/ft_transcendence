import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
export declare class ValidateUserPipe implements PipeTransform {
    private usersService;
    constructor(usersService: UsersService);
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
export declare class UserDisplayNameToIdPipe implements PipeTransform {
    private usersService;
    constructor(usersService: UsersService);
    transform(value: any, metadata: ArgumentMetadata): Promise<number>;
}
