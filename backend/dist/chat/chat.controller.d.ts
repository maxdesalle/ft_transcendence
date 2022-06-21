import { User } from 'src/users/entities/user.entity';
import { WsService } from 'src/ws/ws.service';
import { ChatService } from './chat.service';
import { Session } from './DTO/chat-user.dto';
import { PostDM, Message, RoomInfo, RoomInfoShort, GroupConfig, addGroupUserDTO, Message2Room, addGroupUserByNameDTO } from './DTO/chat.dto';
export declare class ChatController {
    private chatService;
    private wsService;
    constructor(chatService: ChatService, wsService: WsService);
    postDM(me: User, destUserId: number, body: PostDM): Promise<Message>;
    postMsgToRoom(me: User, room_id: number, msg: string, _body: Message2Room): Promise<Message>;
    getDMs(me: User, user_id: number): Promise<Message[]>;
    blockUser(user: Session, blocked_id: number): Promise<any[]>;
    unblockUser(user: Session, blocked_id: number): Promise<any[]>;
    checkBlocked(user: Session): Promise<any[]>;
    getMessagesByRoomId(user: User, room_id: number): Promise<Message[]>;
    groupInfo(room_id: number): Promise<RoomInfo>;
    getConvs(user: User): Promise<RoomInfoShort[]>;
    createGroup(me: User, group_config: GroupConfig): Promise<RoomInfoShort[]>;
    addGroupUser(me: Session, room_id: number, user_id: number, _body?: addGroupUserDTO): Promise<RoomInfo>;
    addGroupUserbyName(me: Session, room_id: number, user_id: number, _body: addGroupUserByNameDTO): Promise<RoomInfo>;
    removeGroup(me: User, room_id: number): Promise<any[]>;
    rmGroupUser(me: Session, room_id: number, user_id: number, unban_hours: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    mute(me: Session, room_id: number, user_id: number, unban_hours: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    unmute(me: Session, room_id: number, user_id: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    promote(me: Session, room_id: number, user_id: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    demote(me: Session, room_id: number, user_id: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    leave(me: User, room_id: number): Promise<RoomInfoShort[]>;
    set_pswd(room_id: number, password: string): Promise<string>;
    set_private(room_id: number, is_private: boolean): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    set_owner(me: Session, room_id: number, user_id: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    join_group(me: Session, room_id: number, password: string): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
}
