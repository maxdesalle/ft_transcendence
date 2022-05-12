import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private usersRepository: Repository<Users>,
	) {}

	async createNewUser(username: string) {
		let user = await this.findByUsername(username);
		if (user != undefined) {
			return user;
		}
		user = new Users();
		user.username = username;
		await this.usersRepository.save(user);
		return user;
	}

	findById(id: number) {
		return this.usersRepository.findOne(id);
	}

	findByUsername(username: string): Promise<Users | undefined> {
		return this.usersRepository.findOne({ username });
	}
	findAll() {
		return this.usersRepository.find();
	}
}
