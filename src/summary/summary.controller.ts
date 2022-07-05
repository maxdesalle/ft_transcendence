import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Usr } from 'nest_app/dist/users/decorators/user.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { SummaryService } from './summary.service';

@Controller('summary')
@UseGuards(JwtGuard)
@ApiTags('summary')
export class SummaryController {
	constructor (
		private summaryService: SummaryService
	) {}

	@Get('me')
	currentUserSummary(
		@Usr() me: User
	) {
		return this.summaryService.userSummary(me.id);
	}
}
