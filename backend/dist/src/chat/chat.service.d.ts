import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Connection, EntityManager } from 'typeorm';
import { Session } from './DTO/chat-user.dto';
import { GroupConfig, Message } from './DTO/chat.dto';
declare class queryAdaptor {
    private manager;
    constructor(manager: EntityManager);
    query(sql_query: string): Promise<{
        rowCount: any;
        rows: any;
    }>;
}
export declare class ChatService {
    private connection;
    private usersService;
    pool: queryAdaptor;
    constructor(connection: Connection, usersService: UsersService);
    sendDMtoUser(me: User, toId: number, msg: string): Promise<Message>;
    get_dm_room(me: Session, friend_id: number): Promise<null | number>;
    create_dm_room(me: Session, friend_id: number): Promise<any>;
    getDMbyUser(me: User, friend_id: number): Promise<any>;
    getMessagesByRoomId(me: User, room_id: number): Promise<any>;
    send_dm(me: Session, message: string): Promise<void>;
    get_blocked(me: Session): Promise<any[]>;
    block(me: Session, block_id: number): Promise<void>;
    unblock(me: Session, block_id: number): Promise<void>;
    getRoomParcipants(room_id: number): Promise<number[]>;
    get_convs(me: User): Promise<any[]>;
    getDMusersID(me: Session): Promise<any>;
    rm_dm_room(me: Session, friend_id: number): Promise<void>;
    groupNameExists(group_name: string): Promise<boolean>;
    create_group(me: Session, group: GroupConfig): Promise<any>;
    get_role(id: number, room_id: number): Promise<0 | 1 | 2 | -1>;
    addGroupUser(me: Session, room_id: number, user_id: number): Promise<void>;
    send_msg_to_room_ws(user_id: number, room_id: number, message: string): Promise<void>;
    send_msg_to_room(me: User, room_id: number, message: string): Promise<Message>;
    getRoomsList(): Promise<any[]>;
    getGroupsList(): Promise<any[]>;
    groupExists(room_id: number): Promise<boolean>;
    rm_group(me: Session, room_id: number): Promise<void>;
    rm_user_group(me: Session, room_id: number, user_id: number, unban_hours: number): Promise<void>;
    mute_user(me: Session, room_id: number, user_id: number, unban_hours: number): Promise<void>;
    unmute_user(me: Session, room_id: number, user_id: number): Promise<void>;
    add_admin_group(me: Session, room_id: number, user_id: number): Promise<void>;
    rm_admin_group(me: Session, room_id: number, user_id: number): Promise<void>;
    is_muted(user_id: number, room_id: number): Promise<boolean>;
    is_banned(user_id: number, room_id: number): Promise<boolean>;
    leave_group(me: Session, room_id: number): Promise<void>;
    set_password(room_id: number, password?: string): Promise<{
        rowCount: any;
        rows: any;
    }>;
    set_private(room_id: number, cond: boolean): Promise<{
        rowCount: any;
        rows: any;
    }>;
    set_owner(me: Session, room_id: number, user_id: number): Promise<void>;
    check_password_match(room_id: number, password: string): Promise<any>;
    is_group_private(room_id: number): Promise<any>;
    roomInfo(room_id: number): Promise<{
        room_id: number;
        room_name: any;
        type: string;
        private: any;
        password_protected: boolean;
        users: any[];
    }>;
    is_group_pswd_protected(room_id: number): Promise<any>;
    join_public_group(me: Session, room_id: number, password?: string): Promise<void>;
}
export {};
