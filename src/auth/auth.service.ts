import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	getHomePage(username: string): string {
		return `<p>Good to see you here ${username} 👋</p><br><p>You can log out <a href="/logout/">here</a>.</p>`
	}

	getLoginPage(): string {
		return '<p>Click <a href="/login/42">here</a> to log in.</p>';
	}

	getErrorLoginPage(error: string): string {
		return `<p>${error}<br><br>Click <a href="/login/42">here</a> to log in.</p>`;
	}
}
