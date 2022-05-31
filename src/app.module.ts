import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseFilesModule } from './database-files/database-files.module';
import { HtmlModule } from './html/html.module';

@Module({
	imports: [AuthModule, UsersModule, TypeOrmModule.forRoot(), DatabaseFilesModule, HtmlModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
