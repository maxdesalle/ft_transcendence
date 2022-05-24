import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseFile } from './entities/databaseFile.entity';

@Injectable()
export class DatabaseFilesService {
	constructor(
		@InjectRepository(DatabaseFile)
		private databaseFilesRespository: Repository<DatabaseFile>
	) {}

	async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
		const newFile = await this.databaseFilesRespository.create({
			filename,
			data: dataBuffer
		})
		await this.databaseFilesRespository.save(newFile);
		return newFile;
	}

	async getFileById(fileId: number) {
		const file = await this.databaseFilesRespository.findOne(fileId);
		if (!file) {
			throw new NotFoundException();
		}
		return file;
	}
}
