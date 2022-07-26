/// <reference types="multer" />
import { StreamableFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { changeNameDto } from './dto/changeName.dto';
export declare class UsersController {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    getAllUsers(): Promise<import("./entities/user.entity").User[]>;
    getProfile(user: any): Promise<import("./entities/user.entity").User>;
    getAvatar(user: any, response: Response): Promise<StreamableFile>;
    getUserById(id: number): Promise<import("./entities/user.entity").User>;
    addAvatar(user: any, file: Express.Multer.File): Promise<string>;
    changeName(user: any, { display_name }: changeNameDto): Promise<import("./entities/user.entity").User>;
}
