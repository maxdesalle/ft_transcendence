import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFilesService } from './database-files.service';
import { DatabaseFile } from './entities/databaseFile.entity';
import { DatabaseFilesController } from './database-files.controller';

@Module({
  providers: [DatabaseFilesService],
	imports: [TypeOrmModule.forFeature([DatabaseFile])],
  exports: [DatabaseFilesService],
  controllers: [DatabaseFilesController]
})
export class DatabaseFilesModule {}
