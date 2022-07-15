import { Injectable } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class SummaryService {
	constructor(
		private friendsService: FriendsService,
		private statsService: StatsService
	) {}

	async userSummary(id: number) {
		const obj = {
			friends: await this.friendsService.listFriendsUsers(id),
			match_history: await this.statsService.getMatchesByPlayer(id),
			stats: await this.statsService.playerStats(id)
		}

		return obj;
	}

}
