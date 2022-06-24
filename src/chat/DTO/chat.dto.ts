import { IsNegative, IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";

export class PostDmDto {
	user_id: number;

	@IsNotEmpty()
	message: string;
}

export class Message2RoomDTO {
	room_id: number;
	
	@IsNotEmpty()
	message: string;
}

export class MessageDTO {
	id: number;
	user_id: number;
	login42: string;
	display_name: string;
	message: string;
	timestamp: Date;
}

export class UserIdDto {
	user_id: number
}

export class RoomIdDto {
	room_id: number
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

export class addGroupUserByNameDTO {
	room_id: number;
	user_display_name: string;
}

export class banDTO {
	room_id: number;
	user_id: number;
	
	@Min(0)
	@IsNumber()
	ban_minutes: number;
}

export class muteDTO {
	room_id: number;
	user_id: number;
	
	@Min(0)
	@IsNumber()
	mute_minutes: number;
}