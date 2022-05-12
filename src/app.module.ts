import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [AuthModule, UsersModule, TypeOrmModule.forRoot()],
	controllers: [],
	providers: [],
})
export class AppModule {}
