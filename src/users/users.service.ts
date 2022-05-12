import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private usersRepository: Repository<Users>) {}

	createNewUser(username: string) {
		const new_user = new Users();
		new_user.username = username;
		return this.usersRepository.save(new_user);
	}

	findById(id: number) {
		return this.usersRepository.findOne(id);
	}

	findAll() {
		return this.usersRepository.find();
	}
}
