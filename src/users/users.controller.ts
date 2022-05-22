import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/auth.controller';
import { UsersService } from './users.service';

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
}
