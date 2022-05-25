import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { DatabaseFile } from './entities/databaseFile.entity';

@Injectable()
export class DatabaseFilesService {
	constructor(
		@InjectRepository(DatabaseFile)
		private databaseFilesRespository: Repository<DatabaseFile>
	) {}

	async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
		const newFile = this.databaseFilesRespository.create({
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

	async uploadDBFileWithQueryRunner(
		dataBuffer: Buffer, filename: string, queryRunner: QueryRunner) {

		const newFile = await queryRunner.manager.create(DatabaseFile, {
			filename,
			data: dataBuffer
		})
		await queryRunner.manager.save(DatabaseFile, newFile);
		return newFile;
	}

	async deleteFileWithQueryRunner(fileId: number, queryRunner: QueryRunner) {
		const deleteResponse = await queryRunner.manager.delete(DatabaseFile, fileId);
		if (!deleteResponse.affected) {
			throw new NotFoundException();
		}
	}
}
