import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {



	// this function has NO references to it (not used anywhere!)
	getErrorLoginPage(error: string): string {
		return `<p>${error}<br><br>Click <a href="/auth/42">here</a> to log in.</p>`;
	}
}
