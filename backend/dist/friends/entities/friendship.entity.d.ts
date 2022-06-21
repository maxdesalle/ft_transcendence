import { User } from "src/users/entities/user.entity";
export declare enum FrienshipStatus {
    pending = 0,
    accepted = 1,
    rejected = 2
}
export declare class Friendship {
    req_user_id: number;
    recv_user_id: number;
    requesting_user: User;
    receiving_user: User;
    status: FrienshipStatus;
}
