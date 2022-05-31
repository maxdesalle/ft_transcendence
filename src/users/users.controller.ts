import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from './decorators/user.decorator';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { imageFileFilter } from './utils/file-upload.utils';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get('/all/')
	async getAllUsers() {
		return await this.usersService.findAll();
	}

	@Get('/all/:id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.usersService.findById(id);
	}

	@Get('/current_user/')
	@UseGuards(JwtGuard)
	async getProfile(@Usr() user) {
		return await this.usersService.findById(user.id);
	}

	// @Get('upload_avatar')
	// @UseGuards(JwtGuard) 
	// uploadAvatar() {
	// 	return this.usersService.getAvatarUploadForm();
	// }

	@Get('avatar')
	@UseGuards(JwtGuard)
	async getAvatar(
		@Usr() user,
		@Res({ passthrough: true }) response: Response) {
		
		let stream: Readable | ReadStream;
		if (!user.avatarId) {
			stream = createReadStream(join(process.cwd(), 'images/avatardefault.png'));
		} else {
			const file = await this.usersService.getAvatar(user.avatarId)
			stream = Readable.from(file.data);
		}
		response.set({ 'Content-Type': 'image' });
		return new StreamableFile(stream);
	}

	@Post('avatar') 
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor('file', { 
		limits: {fileSize: 1000000}, 
		fileFilter: imageFileFilter
		}))
	async addAvatar(
		@Usr() user,
		@UploadedFile() file: Express.Multer.File) {

		if (!file)
			throw new BadRequestException();
		return this.usersService.changeAvatar(
			user.id, file.buffer, file.originalname);
	}

	// route for testing purposes
	@Post('add')
	addUser(@Body('username') username: string) {
		return this.usersService.createNewUser(username);
	}


}
