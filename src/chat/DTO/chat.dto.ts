export class PostDM {
	user_id: number;
	message: string;
}

export class Message {
	id: number;
	user_id: number;
	message: string;
	timestamp: Date;
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