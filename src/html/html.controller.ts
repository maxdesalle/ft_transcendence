import { ArgumentsHost, Catch, Controller, ExceptionFilter, Get, HttpException, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { HtmlService } from './html.service';
import { ApiTags } from '@nestjs/swagger';

@Catch(UnauthorizedException)
export class ViewAuthFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/login');
	}
}


@Controller()
@ApiTags('HTML pages (for testing)')
export class HtmlController {
	constructor(
		private usersService: UsersService,
		private htmlService: HtmlService) {}

	@Get()
	@UseFilters(ViewAuthFilter)
	@UseGuards(JwtGuard)
	async getHomePage(@Usr() user): Promise<string> {
		const user_object = await this.usersService.findById(user.id);
		return this.htmlService.getHomePage(user_object.login42);
	}

	@Get('login')
	getLoginPage(): string {
		return this.htmlService.getLoginPage();
	}
	
	@Get('settings')
	@UseGuards(JwtGuard)
	getSettingsPage(): string {
		return this.htmlService.getSettingsPage();
	}
	
	@Get('upload_avatar')
	@UseGuards(JwtGuard) 
	uploadAvatar() {
		return this.htmlService.getAvatarUploadForm();
	}
}
