import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Points } from './entities/points.entity';

@Module({
  providers: [StatsService],
  imports: [
		TypeOrmModule.forFeature([Match]),
		TypeOrmModule.forFeature([Points]),
  ],
  exports: [StatsService],
  controllers: [StatsController]
})
export class StatsModule {}
