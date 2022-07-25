import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { FriendsModule } from 'src/friends/friends.module';
import { StatsModule } from 'src/stats/stats.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService],
  imports: [FriendsModule, StatsModule, ChatModule]
})
export class SummaryModule {}
