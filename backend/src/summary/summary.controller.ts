import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Usr } from 'src/users/decorators/user.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import { SummaryService } from './summary.service';

@Controller('summary')
@UseGuards(JwtGuard)
@ApiTags('summary')
@UseInterceptors(ClassSerializerInterceptor)
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

	@Get('friends')
	friendsSummary(
		@Usr() me: User
	) {
		return this.summaryService.friendsSummmary(me.id);
	}
}
