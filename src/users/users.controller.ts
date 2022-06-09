import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, Param, ParseIntPipe, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from './decorators/user.decorator';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService,
	) {}

	@Get()
	async getAllUsers() {
		return await this.usersService.findAll();
	}

	@Get('me')
	@UseGuards(JwtGuard)
	async getProfile(@Usr() user) {
		return await this.usersService.findById(user.id);
	}

	@Get('avatar')
	@UseGuards(JwtGuard)
	async getAvatar(
		@Usr() user,
		@Res({ passthrough: true }) response: Response) {
		
		let stream: Readable | ReadStream;
		if (!user.avatarId) {
			stream = createReadStream(join(
				process.cwd(),
				this.configService.get<string>('AVATAR_DEFAULT_FILE')));
		} else {
			const file = await this.usersService.getAvatar(user.avatarId)
			stream = Readable.from(file.data);
		}
		response.set({ 'Content-Type': 'image/png' });
		return new StreamableFile(stream);
	}

	@Get(':id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.usersService.findById(id);
	}


	@Post('avatar') 
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor('file'))
	async addAvatar(
		@Usr() user,
		@UploadedFile() file: Express.Multer.File) {

		if (!file)
			throw new BadRequestException();
		return this.usersService.changeAvatar(
			user.id, file.buffer, file.originalname);
	}

	// route for testing purposes
	// @Post('add')
	// addUser(@Body('username') username: string) {
	// 	return this.usersService.createNewUser(username);
	// }

}
