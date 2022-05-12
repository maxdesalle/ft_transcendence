import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async sayHello() {
		return await this.usersService.findAll();
	}

	@Get(':id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.usersService.findById(id);
	}
}
