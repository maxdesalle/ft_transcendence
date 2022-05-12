import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	getHomePage(): string {
		return '<p>Welcome! Head over to the <a href="/login/">login page</a> to get started.</p>';
	}

	getLoginPage(): string {
		return '<p>Click <a href="/login/42">here</a> to log in.</p>';
	}

	getErrorLoginPage(error: string): string {
		return `<p>${error}<br><br>Click <a href="/login/42">here</a> to log in.</p>`;
	}
}
