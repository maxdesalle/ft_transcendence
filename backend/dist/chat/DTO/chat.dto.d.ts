import { User } from "src/users/entities/user.entity";
export declare class PostDmDto {
    user_id: number;
    message: string;
}
export declare class Message2RoomDTO {
    room_id: number;
    message: string;
}
export declare class MessageDTO {
    id: number;
    user_id: number;
    login42: string;
    display_name: string;
    message: string;
    timestamp: Date;
}
export declare class UserIdDto {
    user_id: number;
}
export declare class RoomIdDto {
    room_id: number;
}
declare class UserRole {
    user_id: number;
    role: string;
}
export declare class RoomInfo {
    room_id: number;
    room_name: string;
    type: string;
    blocked?: boolean;
    private: boolean;
    password_protected: boolean;
    users: UserRole[];
}
export declare class RoomInfoShort {
    room_id: number;
    room_name: string;
    type: string;
    blocked?: boolean;
    participants: User[];
    last_msg: MessageDTO;
}
export declare class GroupConfigDto {
    name: string;
    private?: boolean;
    password?: string;
}
export declare class RoomAndUserDto {
    room_id: number;
    user_id: number;
}
export declare class AddGroupUserByNameDTO {
    room_id: number;
    user_display_name: string;
}
export declare class BanMuteDTO {
    room_id: number;
    user_id: number;
    time_minutes: number;
}
export declare class RoomAndPasswordDto {
    room_id: number;
    password: string;
}
export declare class SetPrivateDto {
    room_id: number;
    private: boolean;
}
export {};
