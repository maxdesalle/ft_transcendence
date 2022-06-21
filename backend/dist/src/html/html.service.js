"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlService = void 0;
const common_1 = require("@nestjs/common");
let HtmlService = class HtmlService {
    getHomePage(username) {
        return `<p>Good to see you here ${username} 👋</p><p>You can check your settings <a href="/settings/">here</a> or log out <a href="/logout/">here</a>.</p>
			<p>You can check your avatar <a href="/users/avatar">here</a> or change it <a href="/upload_avatar">here</a>.</p>
			<img src='users/avatar' width='500'>
			<p>Mock-auth and other cool stuff <a href="/client.html">here</a>.</p>
			<p>API documentation <a href="/api">here</a>.</p>
			`;
    }
    getLoginPage() {
        return `<p>Click <a href="/login/42">here</a> to log in.</p><form action="/login/two-factor-authentication/" method="POST"><div><label for="say">What's your 2FA code?</label><input name="twoFactorAuthenticationCode" id="twoFactorAuthenticationCode" value="twoFactorAuthenticationCode"></div><div><button>Confirm</button></div></form>
			Mock-auth and other cool stuff <a href="/client.html">here</a>.
			<p>API documentation <a href="/api">here</a>.</p>
			`;
    }
    getSettingsPage() {
        return `<p>To activate 2FA, click <a href="/settings/activate-2fa">here</a> and scan the following QR code. Then, return to the login page and put in your authentication code.</p><p>To deactivate 2FA, simply click <a href="/settings/deactivate-2fa">here</a></p><p>To go back to the homepage, click <a href="/">here</a>.</pa>`;
    }
    getAvatarUploadForm() {
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
		`;
    }
};
HtmlService = __decorate([
    (0, common_1.Injectable)()
], HtmlService);
exports.HtmlService = HtmlService;
//# sourceMappingURL=html.service.js.map