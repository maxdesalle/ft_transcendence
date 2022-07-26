import { WsService } from 'src/ws/ws.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Friendship, FrienshipStatus as FriendshipStatus } from './entities/friendship.entity';
import { FriendshipRecvUser, FriendshipRequest, FriendshipReqUser } from './dto/friendReq.dto';
export declare class FriendsService {
    private usersRepository;
    private friendsRepository;
    private usersService;
    private wsService;
    constructor(usersRepository: Repository<User>, friendsRepository: Repository<Friendship>, usersService: UsersService, wsService: WsService);
    friendshipToFriendshipRequest(request: Friendship): FriendshipRequest;
    requestFriendship(my_id: number, user_id: number): Promise<FriendshipRequest>;
    sentRequests(my_id: number): Promise<any>;
    recvdRequests(my_id: number): Promise<any>;
    pendingSentRequests(my_id: number): Promise<FriendshipRecvUser[]>;
    pendingReceivedRequests(my_id: number): Promise<FriendshipReqUser[]>;
    rejectedReceivedRequests(my_id: number): Promise<FriendshipReqUser[]>;
    setFriendshipStatus(my_id: number, requester_id: number, status: FriendshipStatus): Promise<FriendshipRequest>;
    listFriendsIDs(my_id: number): Promise<number[]>;
    listFriendsUsers(my_id: number): Promise<User[]>;
    getUserStatus(user_id: number): string;
}
