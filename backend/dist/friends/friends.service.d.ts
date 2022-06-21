import { WsService } from 'src/ws/ws.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Friendship, FrienshipStatus } from './entities/friendship.entity';
export declare class FriendsService {
    private usersRepository;
    private friendsRepository;
    private usersService;
    private wsService;
    constructor(usersRepository: Repository<User>, friendsRepository: Repository<Friendship>, usersService: UsersService, wsService: WsService);
    requestFriendship(my_id: number, user_id: number): Promise<Friendship>;
    sentRequests(my_id: number): Promise<Friendship[]>;
    recvdRequests(my_id: number): Promise<Friendship[]>;
    pendingSentRequests(my_id: number): Promise<number[]>;
    pendingReceivedRequests(my_id: number): Promise<number[]>;
    rejectedReceivedRequests(my_id: number): Promise<number[]>;
    setFriendshipStatus(my_id: number, requester_id: number, status: FrienshipStatus): Promise<Friendship>;
    listFriendsIDs(my_id: number): Promise<number[]>;
    listFriendsUsers(my_id: number): Promise<User[]>;
    getUserStatus(user_id: number): string;
}
