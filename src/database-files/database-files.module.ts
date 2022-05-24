import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFilesService } from './database-files.service';
import { DatabaseFile } from './entities/databaseFile.entity';

@Module({
  providers: [DatabaseFilesService],
	imports: [TypeOrmModule.forFeature([DatabaseFile])],
  exports: [DatabaseFilesService]
})
export class DatabaseFilesModule {}
