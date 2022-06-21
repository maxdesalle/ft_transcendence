export declare class PostDM {
    user_id: number;
    message: string;
}
export declare class Message {
    id: number;
    user_id: number;
    login42: string;
    display_name: string;
    message: string;
    timestamp: Date;
}
export declare class Message2Room {
    room_id: number;
    message: string;
}
declare class UserRole {
    user_id: number;
    role: string;
}
export declare class RoomInfo {
    room_id: number;
    room_name: string;
    type: string;
    private: boolean;
    password_protected: boolean;
    users: UserRole[];
}
export declare class RoomInfoShort {
    room_id: number;
    room_name: string;
    type: string;
    participants: number[];
}
export declare class GroupConfig {
    name: string;
    private?: boolean;
    password?: string;
}
export declare class addGroupUserDTO {
    room_id: number;
    user_id: number;
}
export declare class addGroupUserByNameDTO {
    room_id: number;
    user_display_name: string;
}
export {};
