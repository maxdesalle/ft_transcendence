import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { FriendsService } from 'src/friends/friends.service';
import { StatsService } from 'src/stats/stats.service';
import { FriendsSummary } from './dto/friends.dto';

@Injectable()
export class SummaryService {
	constructor(
		private friendsService: FriendsService,
		private statsService: StatsService,
		private chatService: ChatService
	) {}

	async userSummary(id: number) {
		const obj = {
			friends: await this.friendsService.listFriendsUsers(id),
			match_history: await this.statsService.getMatchesByPlayer(id),
			stats: await this.statsService.playerStats(id)
		}

		return obj;
	}

	async friendsSummmary(id: number) {
		const users = await this.friendsService.listFriendsUsers(id);
		const friends: FriendsSummary[] = []
		for (let user of users) {
			const friend = {
				user,
				chat_blocked: await this.chatService.is_blocked(id, user.id)
			}
			friends.push(friend);
		}
		return friends;
	}
}
