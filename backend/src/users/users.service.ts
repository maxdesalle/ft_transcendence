import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseFilesService } from 'src/database-files/database-files.service';
import { StatsService } from 'src/stats/stats.service';
import { WsService } from 'src/ws/ws.service';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly databaseFilesService: DatabaseFilesService,
    private dataSource: DataSource,
    private statsService: StatsService,
    private wsService: WsService,
  ) {}

  /** creates new user if non-existant, just returns the user otherwise */
  async createNewUser(login42: string) {
    let user = await this.findByLogin42(login42);
    if (user == undefined) {
      user = new User();
      user.login42 = login42;
      user.display_name = login42;
      const new_user = await this.usersRepository.save(user);
      await this.statsService.newPlayer(new_user.id);
      this.wsService.sendMsgToAll({
        event: 'users: new_user',
        user_id: new_user.id,
      });
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
    return this.usersRepository.findOneBy({ id });
  }

  findByLogin42(login42: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ login42 });
  }

  findByDisplayName(display_name: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ display_name });
  }

  findAll() {
    return this.usersRepository.find();
  }

  async setDisplayName(user_id: number, new_name: string) {
    const user_exists = await this.usersRepository.findOneBy({
      display_name: new_name,
    });
    if (user_exists) throw new ConflictException('name already taken');
    const user = await this.usersRepository.findOneBy({ id: user_id });
    user.display_name = new_name;
    this.usersRepository.save(user);
    return user;
  }

  // changes file in database as transaction.
  // old avatar is deleted.
  async changeAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const currentAvatarId = user.avatarId;
      const avatar =
        await this.databaseFilesService.uploadDBFileWithQueryRunner(
          imageBuffer,
          filename,
          queryRunner,
        );
      await queryRunner.manager.update(User, userId, {
        avatarId: avatar.id,
      });

      if (currentAvatarId) {
        await this.databaseFilesService.deleteFileWithQueryRunner(
          currentAvatarId,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      // return url for new database file
      return avatar.id;
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
