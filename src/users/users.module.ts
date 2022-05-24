import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFilesModule } from 'src/database-files/database-files.module';
import { Users } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([Users]), DatabaseFilesModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
