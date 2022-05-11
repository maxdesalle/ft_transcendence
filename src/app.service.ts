import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHomePage(): string {
		return '<p>Welcome! Please <a href="/login/42">log in</a></p>';
	}
}
