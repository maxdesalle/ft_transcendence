import { User } from "./user.interface";

export enum FriendshipStatus {
    pending,
    accepted,
    rejected,
}

export interface Friendship {
    req_user_id: number;
    recv_user_id: number;
    requesting_user: User;
    receiving_user: User;
    status: FriendshipStatus;
}