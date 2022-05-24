import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Users } from './entities/user.entity';
import { toFileStream } from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private usersRepository: Repository<Users>,
		private readonly databaseFilesService: DatabaseFilesService,
		private readonly configService: ConfigService,
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

	check2FACodeValidity(twoFactorAuthenticationCode: string, user: Users) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	async generateTwoFactorAuthenticationSecret(user: Users) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			// this.configService.get('Transcendence'),
			'Transcendence',
			secret,
		);

		await this.setTwoFactorAuthenticationSecret(secret, user.id);

		await this.turnOnTwoFactorAuthentication(user.id);
		return { secret, otpauthUrl };
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.usersRepository.update(userId, {
			twoFactorAuthenticationSecret: secret,
		});
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
		await this.usersRepository.update(userId, { avatarId: avatar.id });
		return avatar;
	}

}
