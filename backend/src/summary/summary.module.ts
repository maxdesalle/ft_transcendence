import { Module } from '@nestjs/common';
import { FriendsModule } from 'src/friends/friends.module';
import { StatsModule } from 'src/stats/stats.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService],
  imports: [FriendsModule, StatsModule]
})
export class SummaryModule {}
