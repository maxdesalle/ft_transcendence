import { RoomUser, User } from './user.interface';

export interface RoomConfig {
  name: string;
  private?: boolean;
  password?: boolean;
}

export interface RoomInfo {
  room_id: number;
  room_name: string;
  type: string;
  blocked?: boolean;
  private: boolean;
  password_protected: boolean;
  users: RoomUser[];
  last_msg: Message;
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
  role: 'admin' | 'owner' | 'participant';
}

export type WsNotificationEvent =
  | 'ws_auth_success'
  | 'ws_auth_fail'
  | 'chat_dm'
  | 'chat_new_group'
  | 'chat_new_user_in_group'
  | 'chat_room_msg'
  | 'friends: new_request'
  | 'friends: request_accepted'
  | 'friends: request_rejected'
  | 'status: friend_online'
  | 'status: friend_offline'
  | 'status: friend_playing'
  | 'pong: invitation'
  | 'pong: invitation_accepted'
  | 'pong: player_joined'
  | 'ladder_change';
