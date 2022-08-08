import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LadderDto, LadderRankDto, MatchDTO, MatchResultDto, PlayerStatsDto } from './dto/match.dto';
import { Match } from './entities/match.entity';
import { Points } from './entities/points.entity';

const POINTS_LOSS = -100;
const POINTS_WIN_LOWER_RANK = 100;
const POINTS_WIN_HIGHER_RANK = 300;

@Injectable()
export class StatsService {
	static points = new Map<number, number>();

	constructor (
		@InjectRepository(Match)
		private matchRepository: Repository<Match>,
		@InjectRepository(Points)
		private pointsRepository: Repository<Points>,
	) {}

	async newPlayer(user_id: number) {
		const player = new Points();
		player.user_id = user_id;
		this.pointsRepository.save(player);
	}

	async ladder(): Promise<LadderDto[]> {
		const ladder = await this.pointsRepository.find({
			order: {points: 'DESC'},
			relations: ['user_id']
		});
		return ladder.map((obj: any, index, array) => {
			return {
				rank: this.getRank(index, array),
				user_id: obj.user_id.id,
				display_name: obj.user_id.display_name,
				points: obj.points
			}
		});
	}

	getRank(index: number, ladder: Points[]) {
		let rank = index;
		for (let i = index -1; i >=0; --i) {
			if (ladder[i].points === ladder[rank].points)
				--rank;
			else
				return rank + 1;
		}
		return rank + 1;
	}

	async ladderRank(user_id: number): Promise<LadderRankDto> {
		const ladder = await this.ladder();
		const player = ladder.find((value) => value.user_id === user_id);
		return {
			ladder_rank: player?.rank,
			points: player?.points
		};
	}

	// user_id must be valid
	async addPoints(user_id: number, points: number) {
		await this.pointsRepository.createQueryBuilder()
			.update()
			.set({
				points: () => `points + ${points}`
			})
			.where({user_id})
			.execute()
	}

	// user_ids must be valid
	async addMatchPoints(p_win: number, p_loss: number) {
		const ladder = await this.ladder();
		const winner = ladder.find((value) => value.user_id === p_win);
		const loser = ladder.find((value) => value.user_id === p_loss);
		// points for  the winner
		if (winner.rank > loser.rank) 
			await this.addPoints(p_win, POINTS_WIN_HIGHER_RANK);
		else
			await this.addPoints(p_win, POINTS_WIN_LOWER_RANK);
		// points for the loser (avoid dropping below 0)
		if (loser.points >= -POINTS_LOSS)
			await this.addPoints(p_loss, POINTS_LOSS);
	}

	async insertMatch(p1: number, p2: number, p1Score: number, p2Score: number) {
		const match = new Match();
		match.player1 = p1;
		match.player2 = p2;
		match.p1Score = p1Score;
		match.p2Score = p2Score;
		match.timestamp = new Date();
		this.matchRepository.save(match);
		if (p1Score > p2Score) 
			await this.addMatchPoints(p1, p2);
		else
			await this.addMatchPoints(p2, p1);
	}

	filterPlayerInfo(match: any): MatchDTO {
		const {player1, player2, ...selected} = match;
		selected.p1 = {
			user_id: player1.id,
			display_name: player1.display_name
		} 
		selected.p2 = {
			user_id: player2.id,
			display_name: player2.display_name
		} 
		return selected;
	}

	async getAllMatches() {
		const matches = await this.matchRepository.find({
			relations: ['player1', 'player2'],
			order: {timestamp: 'DESC'},
		});
		const res = matches.map(this.filterPlayerInfo);
		return res;
	}

	async getMatchesByPlayer(user_id: number): Promise<MatchDTO[]> {
		const matches = await this.getAllMatches();

		return matches.filter(m => m.p1.user_id === user_id
								|| m.p2.user_id === user_id);
	}

	async getMatchResultsByPlayer(user_id: number): Promise<MatchResultDto[]> {
		const matches = await this.getMatchesByPlayer(user_id);
		const results = matches.map((match) => {
			const is_p1 = match.p1.user_id === user_id;
			const player_score = is_p1 ? match.p1Score : match.p2Score;
			const opponent_score = is_p1 ? match.p2Score : match.p1Score;
			return {
				match_id: match.id,
				result: (player_score > opponent_score) ? 'win' : 'loss',
				opponent: is_p1? match.p2 : match.p1, 
				score: `${player_score} - ${opponent_score}`,
				timestamp: match.timestamp,
			}
		});
		return results;
	}

	async playerStats(user_id: number): Promise<PlayerStatsDto> {
		const results = await this.getMatchResultsByPlayer(user_id);
		const matches_played = results.length;
		const wins = results.reduce((prev, curr) => 
			prev + +(curr.result === 'win'), 0);
		const ladder_info = await this.ladderRank(user_id);

		return {
			ladder_rank: ladder_info.ladder_rank,
			points: ladder_info.points,
			matches_played,
			wins,
			losses: matches_played - wins,
			wins_percent: Math.round(wins / matches_played * 100),
		};
	}

}
