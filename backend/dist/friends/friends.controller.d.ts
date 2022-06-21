import { WsService } from 'src/ws/ws.service';
import { friendReqEventDto, friendRequestDto } from './dto/friendReq.dto';
import { FriendsService } from './friends.service';
export declare class FriendsController {
    private friendsService;
    private wsService;
    constructor(friendsService: FriendsService, wsService: WsService);
    addFriend(me: any, user_id: number, _body: friendRequestDto): Promise<friendReqEventDto>;
    acceptFriend(me: any, user_id: number, _body: friendRequestDto): Promise<friendReqEventDto>;
    rejectFriend(me: any, user_id: number, _body: friendRequestDto): Promise<friendReqEventDto>;
    getPendingSent(me: any): Promise<number[]>;
    getPendingReceived(me: any): Promise<number[]>;
    listRejectedFriends(me: any): Promise<number[]>;
    listFriendsIds(me: any): Promise<number[]>;
    listFriendsUsers(me: any): Promise<import("../users/entities/user.entity").User[]>;
}
