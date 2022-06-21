/// <reference types="multer" />
import { StreamableFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { changeNameDto } from './dto/changeName.dto';
export declare class UsersController {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    getAllUsers(): Promise<User[]>;
    getProfile(user: any): Promise<User>;
    getAvatar(user: any, response: Response): Promise<StreamableFile>;
    getUserById(id: number): Promise<User>;
    addAvatar(user: any, file: Express.Multer.File): Promise<string>;
    changeName(user: any, { display_name }: changeNameDto): Promise<User>;
}
