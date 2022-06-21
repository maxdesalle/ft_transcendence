import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtGuard)
export class StatsController {
	constructor(
		private statsService: StatsService,
	) {}

	@Get('matches')
	matchHistory() {
		return this.statsService.getAllMatches();
	}
}
