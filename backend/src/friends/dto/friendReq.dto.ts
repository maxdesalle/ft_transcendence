import { Friendship } from "../entities/friendship.entity"

export class friendRequestDto {
	user_id: number;
}

export class friendReqEventDto {
	event: string;
	friend_request: Friendship;
}
