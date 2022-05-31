import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { multerConfig } from 'src/config/multer.config';
import { DatabaseFilesModule } from 'src/database-files/database-files.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		DatabaseFilesModule,
		MulterModule.registerAsync(multerConfig),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
