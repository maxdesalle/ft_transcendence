import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntraStrategy } from './strategy/intra.strategy';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [IntraStrategy, AppService],
})
export class AppModule {}
