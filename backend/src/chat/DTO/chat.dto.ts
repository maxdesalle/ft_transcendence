import { IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString, NotContains } from "class-validator";
import { User } from "src/users/entities/user.entity";

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
	blocked?: boolean;
	private: boolean;
	password_protected: boolean;
	users: UserRole[];
}

export class RoomInfoShort {
	room_id: number;
	room_name: string;
	type: string;
	blocked?: boolean;
	participants: User[];
	last_msg: MessageDTO;
}

export class GroupConfigDto {
	@IsNotEmpty()
	@IsString()
	@NotContains("'")
	name: string;

	@IsBoolean()
	@IsOptional()
	private?: boolean;

	@IsOptional()
	@IsString()
	@NotContains("'")
	password?: string;
}

export class RoomAndUserDto {
	room_id: number;
	user_id: number;
}

export class AddGroupUserByNameDTO {
	room_id: number;
	user_display_name: string;
}

export class BanMuteDTO {
	room_id: number;
	user_id: number;
	
	@IsPositive()
	time_minutes: number;
}

export class RoomAndPasswordDto {
	room_id: number;

	@IsString()
	@IsOptional()
	@NotContains("'")
	password: string;
}

export class SetPrivateDto {
	room_id: number;

	@IsBoolean()
	private: boolean;
}
