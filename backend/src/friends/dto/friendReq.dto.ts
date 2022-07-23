import { Friendship, FrienshipStatus } from "../entities/friendship.entity"

export class friendRequestDto {
	user_id: number;
}

export class friendReqEventDto {
	event: string;
	friend_request: FriendshipRequest;
}

export class FriendshipRequest {
	requesting_user: {
		id: number,
		display_name: string;
	};
	receiving_user: {
		id: number,
		display_name: string;
	};
	status: FrienshipStatus;
}

export class FriendshipReqUser {
	req_user_id: number;
	status: number;
}

export class FriendshipRecvUser {
	recv_user_id: number;
	status: number;
}
