import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchDTO } from './dto/match.dto';
import { Match } from './entities/match.entity';
import { Points } from './entities/points.entity';

const POINTS_LOSS = -100;
const POINTS_WIN_LOWER_RUNG = 100;
const POINTS_WIN_HIGHER_RUNG = 300;

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

	async ladder() {
		const ladder = await this.pointsRepository.find({
			order: {points: 'DESC'},
			relations: ['user_id']
		});
		return ladder.map((obj: any, index, array) => {
			return {
				rung: this.getRung(index, array),
				user_id: obj.user_id.id,
				display_name: obj.user_id.display_name,
				points: obj.points
			}
		});
	}

	getRung(index: number, ladder: Points[]) {
		let rung = index;
		for (let i = index -1; i >=0; --i) {
			if (ladder[i].points === ladder[rung].points)
				--rung;
			else
				return rung + 1;
		}
		return rung + 1;
	}

	async ladderLevel(user_id: number) {
		const ladder = await this.ladder();
		const player = ladder.find((value) => value.user_id === user_id);
		return player?.rung;
	}

	// user_id must be valid
	async addPoints(user_id: number, points: number) {
		this.pointsRepository.createQueryBuilder()
			.update()
			.set({
				points: () => `points + ${points}`
			})
			.where({user_id})
			.execute()
		// const user_points = await this.pointsRepository.findOne({user_id});
		// console.log(user_points);
		// user_points.points += points;
		// this.pointsRepository.save(user_points);

		// this.pointsRepository.update(user_id, {points})
	}

	async addMatchPoints(p_win: number, p_loss: number) {
		const ladder = await this.ladder();
		const winner = ladder.find((value) => value.user_id === p_win);
		const loser = ladder.find((value) => value.user_id === p_loss);
		// points for  the winner
		if (winner.rung > loser.rung) 
			this.addPoints(p_win, POINTS_WIN_HIGHER_RUNG);
		else
			this.addPoints(p_win, POINTS_WIN_LOWER_RUNG);
		// points for the loser (avoid dropping below 0)
		if (loser.points >= -POINTS_LOSS)
			this.addPoints(p_loss, POINTS_LOSS);
	}

	insertMatch(p1: number, p2: number, p1Score: number, p2Score: number) {
		const match = new Match();
		match.player1 = p1;
		match.player2 = p2;
		match.p1Score = p1Score;
		match.p2Score = p2Score;
		match.timestamp = new Date();
		this.matchRepository.save(match);
		if (p1Score > p2Score) 
			this.addMatchPoints(p1, p2);
		else
			this.addMatchPoints(p2, p1);
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

	async getMatchesByPlayer(user_id: number) {
		const matches = await this.matchRepository.find({
			where: [{ player1: user_id}, { player2: user_id}],
			relations: ['player1', 'player2'],
			order: {timestamp: 'DESC'},
			// loadRelationIds: true
		});
		const res = matches.map(this.filterPlayerInfo);
		return res;
	}

	async getMatchResultsByPlayer(user_id: number) {
		const matches = await this.getMatchesByPlayer(user_id);
		const results = matches.map((match) => {
			const is_p1 = match.p1.user_id === user_id;
			const player_score = is_p1 ? match.p1Score : match.p2Score;
			const opponent_score = is_p1 ? match.p2Score : match.p1Score;
			return {
				result: (player_score > opponent_score) ? 'win' : 'loss',
				opponent: is_p1? match.p2 : match.p1, 
				score: `${player_score} - ${opponent_score}`,
				timestamp: match.timestamp,
			}
		});
		return results;
	}

	async playerStats(user_id: number) {
		const results = await this.getMatchResultsByPlayer(user_id);
		const matches_played = results.length;
		const wins = results.reduce((prev, curr) => 
			prev + +(curr.result === 'win'), 0);

		return {
			matches_played,
			wins,
			losses: matches_played - wins,
			wins_percent: wins / matches_played,
		};
	}

}
