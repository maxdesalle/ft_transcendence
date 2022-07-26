import { User } from 'src/users/entities/user.entity';
import { WsService } from 'src/ws/ws.service';
import { ChatService } from './chat.service';
import { PostDmDto, MessageDTO, RoomInfo, GroupConfigDto, Message2RoomDTO, AddGroupUserByNameDTO, UserIdDto, BanMuteDTO, RoomIdDto, RoomAndUserDto, RoomAndPasswordDto, SetPrivateDto } from './DTO/chat.dto';
export declare class ChatController {
    private chatService;
    private wsService;
    constructor(chatService: ChatService, wsService: WsService);
    postDM(me: User, destUserId: number, body: PostDmDto): Promise<MessageDTO>;
    getDMs(me: User, user_id: number): Promise<MessageDTO[]>;
    blockUser(me: User, blocked_id: number, _body: UserIdDto): Promise<number[]>;
    unblockUser(me: User, blocked_id: number, _body: UserIdDto): Promise<number[]>;
    checkBlocked(user: User): Promise<number[]>;
    getPublicRooms(): Promise<RoomInfo[]>;
    join_group(me: User, room_id: number, password: string, _room: RoomAndPasswordDto): Promise<RoomInfo>;
    leave(me: User, room_id: number, _room: RoomIdDto): Promise<RoomInfo[]>;
    postGroupMsg(me: User, room_id: number, body: Message2RoomDTO): Promise<MessageDTO>;
    getGroupMessages(me: User, room_id: number): Promise<MessageDTO[]>;
    createGroup(me: User, group_config: GroupConfigDto): Promise<RoomInfo>;
    removeGroup(me: User, room_id: number, _body: RoomIdDto): Promise<{
        room_id: number;
    }>;
    addGroupUser(me: User, room_id: number, user_id: number, _body?: RoomAndUserDto): Promise<RoomInfo>;
    addGroupUserbyName(me: User, room_id: number, user_id: number, _body: AddGroupUserByNameDTO): Promise<RoomInfo>;
    banUser(me: User, room_id: number, user_id: number, ban_minutes: number, _body: BanMuteDTO): Promise<RoomInfo>;
    unbanUser(me: User, room_id: number, user_id: number, _body: RoomAndUserDto): Promise<RoomInfo>;
    mute(me: User, room_id: number, user_id: number, mute_minutes: number, _body: BanMuteDTO): Promise<RoomInfo>;
    unmute(me: User, room_id: number, user_id: number, _body: RoomAndUserDto): Promise<RoomInfo>;
    promote(me: User, room_id: number, user_id: number, _body: RoomAndUserDto): Promise<RoomInfo>;
    demote(me: User, room_id: number, user_id: number, _body: RoomAndUserDto): Promise<RoomInfo>;
    set_pswd(me: User, room_id: number, body: RoomAndPasswordDto): Promise<string>;
    set_private(me: User, room_id: number, body: SetPrivateDto): Promise<RoomInfo>;
    set_owner(me: User, room_id: number, user_id: number, _body: RoomAndUserDto): Promise<RoomInfo>;
    groupInfo(room_id: number): Promise<RoomInfo>;
    getConvs(user: User): Promise<RoomInfo[]>;
    postMsgToRoom(me: User, room_id: number, body: Message2RoomDTO): Promise<MessageDTO>;
    getMessagesByRoomId(me: User, room_id: number): Promise<MessageDTO[]>;
}
