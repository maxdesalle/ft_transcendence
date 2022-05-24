import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/auth.controller';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

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
	async getProfile(@User() user) {
		return await this.usersService.findById(user.id);
	}

	@Post('avatar/:id') // "":id is a temp solution before the authguard is used"
	// @UseGuards(JwtGuard) // use @User to get request's user
	@UseInterceptors(FileInterceptor('file'))
	async addAvatar(@Param('id', ParseIntPipe) id: number,
					@UploadedFile() file: Express.Multer.File) {
		return this.usersService.addAvatar(
			id, file.buffer, file.originalname);
	}

	// route for testing purposes
	@Post('add')
	addUser(@Body('username') username: string) {
		return this.usersService.createNewUser(username);
	}
}
