/// <reference types="node" />
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { Connection, Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    private readonly databaseFilesService;
    private connection;
    constructor(usersRepository: Repository<User>, databaseFilesService: DatabaseFilesService, connection: Connection);
    createNewUser(login42: string): Promise<User>;
    turnOnTwoFactorAuthentication(userId: number): Promise<import("typeorm").UpdateResult>;
    turnOffTwoFactorAuthentication(userId: number): Promise<import("typeorm").UpdateResult>;
    setTwoFactorAuthenticationSecret(secret: string, userId: number): Promise<import("typeorm").UpdateResult>;
    findById(id: number): Promise<User>;
    findByLogin42(login42: string): Promise<User | undefined>;
    findByDisplayName(display_name: string): Promise<User | undefined>;
    findAll(): Promise<User[]>;
    setDisplayName(user_id: number, new_name: string): Promise<User>;
    changeAvatar(userId: number, imageBuffer: Buffer, filename: string): Promise<string>;
    getAvatar(avatarId: number): Promise<import("../database-files/entities/databaseFile.entity").DatabaseFile>;
}
