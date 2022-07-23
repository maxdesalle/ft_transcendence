import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Connection, EntityManager } from 'typeorm';
import { GroupConfigDto, MessageDTO, RoomInfo, RoomInfoShort } from './DTO/chat.dto';
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
    send_msg_to_room(me: User, room_id: number, message: string): Promise<MessageDTO>;
    getMessagesByRoomId(room_id: number): Promise<MessageDTO[]>;
    get_convs(me: User): Promise<RoomInfoShort[]>;
    roomInfo(room_id: number): Promise<RoomInfo>;
    postDM(me: User, toId: number, msg: string): Promise<MessageDTO>;
    postDMbyRoomId(me: User, room_id: number, msg: string): Promise<MessageDTO>;
    get_dm_room(me: User, friend_id: number): Promise<null | number>;
    create_dm_room(me: User, friend_id: number): Promise<any>;
    getDMbyUser(me: User, user_id: number): Promise<MessageDTO[]>;
    getDMsByRoomID(me: User, room_id: number): Promise<MessageDTO[]>;
    block_user(me: User, block_id: number): Promise<void>;
    unblock_user(me: User, block_id: number): Promise<void>;
    postGroupMsg(me: User, room_id: number, message: string): Promise<MessageDTO>;
    getGroupMessages(me: User, room_id: number): Promise<MessageDTO[]>;
    create_group(me: User, group: GroupConfigDto): Promise<any>;
    rm_group(me: User, room_id: number): Promise<void>;
    addGroupUser(me: User, room_id: number, user_id: number): Promise<void>;
    addGroupUserRoot(room_id: number, user_id: number): Promise<void>;
    set_unban_timer(room_id: number, user_id: number, time_minutes: number): void;
    ban_group_user(me: User, room_id: number, user_id: number, ban_minutes: number): Promise<void>;
    unban_group_user(me: User, room_id: number, user_id: number): Promise<void>;
    mute_user(me: User, room_id: number, user_id: number, mute_minutes: number): Promise<void>;
    unmute_user(me: User, room_id: number, user_id: number): Promise<void>;
    add_admin_group(me: User, room_id: number, user_id: number): Promise<void>;
    rm_admin_group(me: User, room_id: number, user_id: number): Promise<void>;
    set_password(me: User, room_id: number, password?: string): Promise<{
        rowCount: any;
        rows: any;
    }>;
    set_private(me: User, room_id: number, cond: boolean): Promise<{
        rowCount: any;
        rows: any;
    }>;
    set_owner(me: User, room_id: number, user_id: number): Promise<void>;
    check_password_match(room_id: number, password: string): Promise<any>;
    join_public_group(me: User, room_id: number, password?: string): Promise<void>;
    leave_group(me: User, room_id: number): Promise<void>;
    showPublicRooms(): Promise<RoomInfo[]>;
    is_muted(user_id: number, room_id: number): Promise<boolean>;
    is_banned(user_id: number, room_id: number): Promise<boolean>;
    is_room_participant(user_id: number, room_id: number): Promise<boolean>;
    is_blocked(my_id: number, other_user_id: number): Promise<boolean>;
    get_role(id: number, room_id: number): Promise<0 | 1 | 2 | -1>;
    isBlockedDMroom(room_id: number): Promise<boolean>;
    groupNameExists(group_name: string): Promise<boolean>;
    isDmRoom(room_id: number): Promise<boolean>;
    isGroupRoom(room_id: number): Promise<boolean>;
    is_group_private(room_id: number): Promise<any>;
    is_group_pswd_protected(room_id: number): Promise<any>;
    listRooms(): Promise<number[]>;
    listGroups(): Promise<number[]>;
    listPublicGroups(): Promise<number[]>;
    listRoomParticipants(room_id: number): Promise<number[]>;
    listBlockedUsers(my_id: number): Promise<number[]>;
}
export {};
