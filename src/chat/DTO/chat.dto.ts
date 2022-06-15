export class PostDM {
	user_id: number;
	message: string;
}

export class Message {
	id: number;
	user_id: number;
	username: string;
	chosen_name: string;
	message: string;
	timestamp: Date;
}

export class Message2Room {
	room_id: number;
	message: string;
}

class UserRole {
	user_id: number;
	role: string;
}

export class RoomInfo {
	room_id: number;
	room_name: string;
	type: string;
	private: boolean;
	password_protected: boolean;
	users: UserRole[];
}

export class RoomInfoShort {
	room_id: number;
	room_name: string;
	type: string;
	participants: number[];
}

export class GroupConfig {
	name: string;
	private?: boolean;
	password?: string;
}

export class addGroupUserDTO {
	room_id: number;
	user_id: number;
}
