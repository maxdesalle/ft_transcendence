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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ws_service_1 = require("../ws/ws.service");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
const typeorm_2 = require("typeorm");
const friendship_entity_1 = require("./entities/friendship.entity");
const pong_gateway_1 = require("../pong/pong.gateway");
let FriendsService = class FriendsService {
    constructor(usersRepository, friendsRepository, usersService, wsService) {
        this.usersRepository = usersRepository;
        this.friendsRepository = friendsRepository;
        this.usersService = usersService;
        this.wsService = wsService;
    }
    async requestFriendship(my_id, user_id) {
        const me = await this.usersService.findById(my_id);
        const friend = await this.usersService.findById(user_id);
        if (!friend || my_id === user_id)
            throw new common_1.BadRequestException("bad user id");
        if (await this.friendsRepository.findOne({
            req_user_id: user_id,
            recv_user_id: my_id
        })
            || await this.friendsRepository.findOne({
                req_user_id: my_id,
                recv_user_id: user_id
            }))
            throw new common_1.BadRequestException('friendship request already exists');
        const friendship = new friendship_entity_1.Friendship();
        friendship.requesting_user = me;
        friendship.req_user_id = my_id;
        friendship.receiving_user = friend;
        friendship.recv_user_id = user_id;
        await this.friendsRepository.save(friendship);
        friendship.receiving_user.twoFactorAuthenticationSecret = undefined;
        friendship.requesting_user.twoFactorAuthenticationSecret = undefined;
        return friendship;
    }
    async sentRequests(my_id) {
        const me = await this.usersRepository.findOne(my_id, {
            relations: ['requested_friendships']
        });
        return me.requested_friendships;
    }
    async recvdRequests(my_id) {
        const me = await this.usersRepository.findOne(my_id, {
            relations: ['received_friendships']
        });
        return me.received_friendships;
    }
    async pendingSentRequests(my_id) {
        return (await this.sentRequests(my_id))
            .filter(f => f.status === friendship_entity_1.FrienshipStatus.pending)
            .map(obj => obj.recv_user_id);
    }
    async pendingReceivedRequests(my_id) {
        return (await this.recvdRequests(my_id))
            .filter(f => f.status === friendship_entity_1.FrienshipStatus.pending)
            .map(obj => obj.req_user_id);
    }
    async rejectedReceivedRequests(my_id) {
        return (await this.recvdRequests(my_id))
            .filter(f => f.status === friendship_entity_1.FrienshipStatus.rejected)
            .map(obj => obj.req_user_id);
    }
    async setFriendshipStatus(my_id, requester_id, status) {
        const request = await this.friendsRepository.findOne({
            recv_user_id: my_id,
            req_user_id: requester_id
        });
        if (!request)
            throw new common_1.BadRequestException("friendship request does not exist");
        request.status = status;
        return this.friendsRepository.save(request);
    }
    async listFriendsIDs(my_id) {
        const me = await this.usersRepository.findOne(my_id, {
            relations: ['received_friendships', 'requested_friendships']
        });
        return [].concat(me.received_friendships
            .filter(f => f.status === friendship_entity_1.FrienshipStatus.accepted)
            .map(obj => obj.req_user_id), me.requested_friendships
            .filter(f => f.status === friendship_entity_1.FrienshipStatus.accepted)
            .map(obj => obj.recv_user_id));
    }
    async listFriendsUsers(my_id) {
        const friends_ids = await this.listFriendsIDs(my_id);
        const users = await this.usersRepository.findByIds(friends_ids);
        users.forEach(user => user.statuss = this.getUserStatus(user.id));
        return users;
    }
    getUserStatus(user_id) {
        if (pong_gateway_1.playing.has(user_id))
            return 'playing';
        if (this.wsService.isUserOnline(user_id))
            return 'online';
        return 'offline';
    }
};
FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(friendship_entity_1.Friendship)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => ws_service_1.WsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        ws_service_1.WsService])
], FriendsService);
exports.FriendsService = FriendsService;
//# sourceMappingURL=friends.service.js.map