import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>) {}

	createNewUser(username: string)
	{
		const new_user = new User();
		new_user.username = username;

		this.usersRepository.save(new_user);
		return new_user;
	}
}
