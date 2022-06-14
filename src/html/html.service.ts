import { Injectable } from '@nestjs/common';

@Injectable()
export class HtmlService {
	getHomePage(username: string): string {
		return `<p>Good to see you here ${username} 👋</p><p>You can check your settings <a href="/settings/">here</a> or log out <a href="/logout/">here</a>.</p>
			<p>You can check your avatar <a href="/users/avatar">here</a> or change it <a href="/upload_avatar">here</a>.</p>
			<img src='users/avatar' width='500'>
			`;
	}

	getLoginPage(): string {
		return `<p>Click <a href="/login/42">here</a> to log in.</p><form action="/login/two-factor-authentication/" method="POST"><div><label for="say">What's your 2FA code?</label><input name="twoFactorAuthenticationCode" id="twoFactorAuthenticationCode" value="twoFactorAuthenticationCode"></div><div><button>Confirm</button></div></form>`;
	}

	getSettingsPage(): string {
		return `<p>To activate 2FA, click <a href="/settings/activate-2fa">here</a> and scan the following QR code. Then, return to the login page and put in your authentication code.</p><p>To deactivate 2FA, simply click <a href="/settings/deactivate-2fa">here</a></p><p>To go back to the homepage, click <a href="/">here</a>.</pa>`;
	}
	
	getAvatarUploadForm(): string {
		return `
			<!DOCTYPE html>
			<html>
			<body>
			<form action="/users/avatar" method="post" enctype="multipart/form-data">
			<p><input type="file" name="file"
			<p><button type="submit">Upload</button>
			</form> 
			</body>
			</html>
		`
	}
}
