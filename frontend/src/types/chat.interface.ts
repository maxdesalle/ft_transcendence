import { User } from "./user.interface";

export interface RoomConfig {
  name: string;
  private?: boolean;
  password?: boolean;
}

export interface RoomInfoShort {
  last_msg: Message;
  room_id: number;
  room_name: string;
  type: string;
  participants: User[];
}

export interface Message {
  id: number;
  user_id: number;
  message: string;
  timestamp: Date;
  room_id?: number;
  chosen_name: string;
}

export interface UserRole {
  user_id: number;
  role: string;
}

export interface RoomInfo {
  room_id: number;
  room_name: string;
  type: string;
  blocked?: boolean;
  private: boolean;
  password_protected: boolean;
  users: UserRole[];
}
