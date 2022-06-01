import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { Connection, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly databaseFilesService: DatabaseFilesService,
		private connection: Connection
	) {}

	async createNewUser(username: string) {
		let user = await this.findByUsername(username);
		if (user == undefined) {
			user = new User();
			user.username = username;
			await this.usersRepository.save(user);
		}
		return user;
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true,
		});
	}

	async turnOffTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: false,
		});
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.usersRepository.update(userId, {
			twoFactorAuthenticationSecret: secret,
		});
	}

	findById(id: number) {
		return this.usersRepository.findOne(id);
	}

	findByUsername(username: string): Promise<User | undefined> {

		return this.usersRepository.findOne({ username });
	}

	findAll() {
		return this.usersRepository.find();
	}

	// changes file in database as transaction.
	// old avatar is deleted.
	async changeAvatar(userId: number, imageBuffer: Buffer, filename: string) {
		const queryRunner = this.connection.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await queryRunner.manager.findOne(User, userId);
			const currentAvatarId = user.avatarId;
			const avatar = await this.databaseFilesService.uploadDBFileWithQueryRunner(
				imageBuffer, filename, queryRunner);
			await queryRunner.manager.update(User, userId, {
				avatarId: avatar.id
			});

			if (currentAvatarId) {
				await this.databaseFilesService.deleteFileWithQueryRunner(
					currentAvatarId, queryRunner);
			}

			await queryRunner.commitTransaction();

			// return avatar
			return `Avatar was succesfully updated. New avatar: ${avatar.filename}`;
		} catch {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
	}

	async getAvatar(avatarId: number) {
		return this.databaseFilesService.getFileById(avatarId);
	}

}
