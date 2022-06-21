import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { match } from 'assert';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';

@Injectable()
export class StatsService {
	constructor (
		@InjectRepository(Match)
		private matchRepository: Repository<Match>,

	) {}

	insertMatch(p1: number, p2: number, p1Score: number, p2Score: number) {
		const match = new Match();
		match.player1 = p1;
		match.player2 = p2;
		match.p1Score = p1Score;
		match.p2Score = p2Score;
		match.timestamp = new Date();
		this.matchRepository.save(match);
	}

	async getAllMatches() {
		const matches = await this.matchRepository.find(
			{ relations: ['player1', 'player2']}
		);
		matches.forEach((match: any) => {
			delete match.player1.isTwoFactorAuthenticationEnabled;
			delete match.player1.twoFactorAuthenticationSecret;
			delete match.player2.isTwoFactorAuthenticationEnabled;
			delete match.player2.twoFactorAuthenticationSecret;
		});
		return matches;
	}
}
