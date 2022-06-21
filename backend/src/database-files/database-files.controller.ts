import { Controller, Get, Param, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'stream';
import { DatabaseFilesService } from './database-files.service';

@Controller('database-files')
@ApiTags('database-files')
export class DatabaseFilesController {
	constructor(
		private readonly databaseFilesService: DatabaseFilesService
	) { }

	@Get(':id')
	async getDatabaseFileById(
		@Param('id', ParseIntPipe) id: number,
		@Res({ passthrough: true }) response: Response
	) {

		const file = await this.databaseFilesService.getFileById(id);
		const stream = Readable.from(file.data);

		response.set({ 'Content-Type': 'image/png' });

		return new StreamableFile(stream);
	}
}
