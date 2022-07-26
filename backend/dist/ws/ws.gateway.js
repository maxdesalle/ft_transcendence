"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_service_1 = require("./ws.service");
let WsGateway = class WsGateway {
    constructor(wsService) {
        this.wsService = wsService;
    }
    handleConnection(client, req) {
        let user;
        try {
            user = this.wsService.getUserFromUpgradeRequest(req);
        }
        catch (error) {
            client.send(JSON.stringify({
                event: "ws_auth_fail",
                reason: "no valid JWT"
            }));
            client.close(1008, 'Bad credentials');
            return;
        }
        if (this.wsService.isUserOnline(user.id)) {
            client.send(JSON.stringify({
                event: "ws_auth_fail",
                reason: "already connected"
            }));
            client.close(1008, 'user already connected via another socket');
            return;
        }
        this.wsService.setUserOnline(user.id, client);
        console.log(`user ${user.id} (${user.login42}) is connected.`);
        client.send(JSON.stringify({
            event: "ws_auth_success",
        }));
        this.wsService.notifyStatusChangeToFriends(user.id, 'online');
    }
    handleDisconnect(client) {
        const user_id = this.wsService.getUserFromSocket(client);
        if (this.wsService.setUserOffline(user_id)) {
            console.log(`user ${user_id} disconnected.`);
            this.wsService.notifyStatusChangeToFriends(user_id, 'offline');
        }
    }
};
WsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [ws_service_1.WsService])
], WsGateway);
exports.WsGateway = WsGateway;
//# sourceMappingURL=ws.gateway.js.map