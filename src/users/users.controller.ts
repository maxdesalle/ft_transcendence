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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { fileUploadDto } from './dto/fileUpload.dto';
import { changeNameDto } from './dto/changeName.dto';

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
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'avatar image file',
		type: fileUploadDto
	})
	@UseInterceptors(FileInterceptor('file'))
	async addAvatar(
		@Usr() user,
		@UploadedFile() file: Express.Multer.File) {

		if (!file)
			throw new BadRequestException();
		return this.usersService.changeAvatar(
			user.id, file.buffer, file.originalname);
	}

	@Post('set_display_name')
	@UseGuards(JwtGuard)
	changeName(
		@Usr() user,
		@Body() {display_name}: changeNameDto
	) {
		return this.usersService.setDisplayName(user.id, display_name);
	}

}
