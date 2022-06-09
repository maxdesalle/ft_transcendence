import { Body, ClassSerializerInterceptor, Controller, Get, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('mock-auth')
@UseInterceptors(ClassSerializerInterceptor)
export class MockAuthController {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	@Post('register')
	addUser(@Body('username') username: string) {
		return this.usersService.createNewUser(username);
	}

	@Post('login')
	async getUserLoggedIn(
		@Res( { passthrough: true}) res: Response,
		@Body('username') username: string
	) {
		const user: User = await this.usersService.createNewUser(username);
		const jwtToken = this.jwtService.sign({
			id: user.id,
			username: user.username
		});
		res.cookie('jwt_token', jwtToken);
		return `Logged in as ${user.username}`;
	}

	@Get('logout')
	logout(
		@Res( { passthrough: true}) res: Response,
	) {
		res.clearCookie('jwt_token');
		return `Logged out`
	}
}
