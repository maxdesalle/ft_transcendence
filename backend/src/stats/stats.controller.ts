import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtGuard)
@ApiTags('stats')
export class StatsController {
	constructor(
		private statsService: StatsService,
	) {}

	@Get('matches')
	matchHistory() {
		return this.statsService.getAllMatches();
	}

	@Get('matches/:user_id')
	matchHistoryUser(
		@Param('user_id', ParseIntPipe) user_id: number
	) {
		return this.statsService.getMatchesByPlayer(user_id);
	} 

	@Get('results/:user_id')
	matchResultsUser(
		@Param('user_id', ParseIntPipe) user_id: number
	) {
		return this.statsService.getMatchResultsByPlayer(user_id);
	}

	@Get('summary/:user_id')
	playerStats(
		@Param('user_id', ParseIntPipe) user_id: number
	) {
		return this.statsService.playerStats(user_id);
	}

	@Get('ladder')
	ladder() {
		return this.statsService.ladder();
	}

	@Get('ladder_rank/:user_id')
	ladderRank(
		@Param('user_id', ParseIntPipe) user_id: number
	) {
		return this.statsService.ladderRank(user_id);
	}

}
