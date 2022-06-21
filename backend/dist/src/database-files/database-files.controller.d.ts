import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseFilesService } from './database-files.service';
export declare class DatabaseFilesController {
    private readonly databaseFilesService;
    constructor(databaseFilesService: DatabaseFilesService);
    getDatabaseFileById(id: number, response: Response): Promise<StreamableFile>;
}
