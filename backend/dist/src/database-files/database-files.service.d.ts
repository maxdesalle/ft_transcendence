/// <reference types="node" />
import { QueryRunner, Repository } from 'typeorm';
import { DatabaseFile } from './entities/databaseFile.entity';
export declare class DatabaseFilesService {
    private databaseFilesRespository;
    constructor(databaseFilesRespository: Repository<DatabaseFile>);
    uploadDatabaseFile(dataBuffer: Buffer, filename: string): Promise<DatabaseFile>;
    getFileById(fileId: number): Promise<DatabaseFile>;
    uploadDBFileWithQueryRunner(dataBuffer: Buffer, filename: string, queryRunner: QueryRunner): Promise<DatabaseFile>;
    deleteFileWithQueryRunner(fileId: number, queryRunner: QueryRunner): Promise<void>;
}
