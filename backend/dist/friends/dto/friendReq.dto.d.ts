import { FrienshipStatus } from '../entities/friendship.entity';
export declare class friendRequestDto {
    user_id: number;
}
export declare class friendReqEventDto {
    event: string;
    friend_request: FriendshipRequest;
}
export declare class FriendshipRequest {
    requesting_user: {
        id: number;
        display_name: string;
    };
    receiving_user: {
        id: number;
        display_name: string;
    };
    status: FrienshipStatus;
}
export declare class FriendshipReqUser {
    req_user_id: number;
    status: number;
}
export declare class FriendshipRecvUser {
    recv_user_id: number;
    status: number;
}
