import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [TypeOrmModule.forFeature([Users]), ConfigModule.forRoot()],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
