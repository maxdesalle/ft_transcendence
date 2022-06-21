import { Friendship } from "../entities/friendship.entity";
export declare class friendRequestDto {
    user_id: number;
}
export declare class friendReqEventDto {
    event: string;
    friend_request: Friendship;
}
