import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseFilesModule } from './database-files/database-files.module';

@Module({
	imports: [AuthModule, UsersModule, TypeOrmModule.forRoot(), DatabaseFilesModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
