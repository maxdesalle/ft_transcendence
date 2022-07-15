import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseFilesModule } from './database-files/database-files.module';
import { HtmlModule } from './html/html.module';
import { ConfigModule } from '@nestjs/config';
import { typeormConfig } from 'src/config/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { MockAuthModule } from './mock_auth/mock_auth.module';
import { FriendsModule } from './friends/friends.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { WsModule } from './ws/ws.module';
import { PongModule } from './pong/pong.module';
import { StatsModule } from './stats/stats.module';
import { SummaryModule } from './summary/summary.module';

@Module({
	imports: [
		AuthModule, 
		UsersModule, 
		DatabaseFilesModule, 
		HtmlModule,
		ConfigModule.forRoot({isGlobal: true}),
		TypeOrmModule.forRootAsync(typeormConfig),
		ChatModule,
		MockAuthModule,
		FriendsModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		WsModule,
		PongModule,
		StatsModule,
		SummaryModule
	],
	controllers: [],
})
export class AppModule {}
