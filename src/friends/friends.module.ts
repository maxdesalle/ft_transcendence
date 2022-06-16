import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { Friendship } from './entities/friendship.entity';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { ChatModule } from 'src/chat/chat.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  providers: [FriendsService],
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Friendship]),
		UsersModule,
		WebsocketsModule
	],
	controllers: [FriendsController],

})
export class FriendsModule {}
