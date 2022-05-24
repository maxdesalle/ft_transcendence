import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private usersRepository: Repository<Users>,
		private readonly databaseFilesService: DatabaseFilesService,
	) {}

	async createNewUser(username: string) {
		let user = await this.findByUsername(username);
		if (user == undefined) {
			user = new Users();
			user.username = username;
			await this.usersRepository.save(user);
		}
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

	async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
		const avatar = await this.databaseFilesService.uploadDatabaseFile(
			imageBuffer, filename);
		await this.usersRepository.update(userId, {
			avatarId: avatar.id
		})
		return avatar;
	}

}
