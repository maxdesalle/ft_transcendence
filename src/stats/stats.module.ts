import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  providers: [StatsService],
  imports: [
		TypeOrmModule.forFeature([Match]),
  ],
  exports: [StatsService],
  controllers: [StatsController]
})
export class StatsModule {}
