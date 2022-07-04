"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const PARTICIPANT = 0;
const ADMIN = 1;
const OWNER = 2;
class queryAdaptor {
    constructor(manager) {
        this.manager = manager;
    }
    async query(sql_query) {
        const result = await this.manager.query(sql_query);
        return {
            rowCount: result.length,
            rows: result
        };
    }
}
let ChatService = class ChatService {
    constructor(connection, usersService) {
        this.connection = connection;
        this.usersService = usersService;
        this.pool = new queryAdaptor(connection.manager);
    }
    async send_msg_to_room(me, room_id, message) {
        const messageRepository = this.connection.getRepository(message_entity_1.Message);
        const new_message = new message_entity_1.Message();
        new_message.room_id = room_id;
        new_message.user_id = me.id;
        new_message.message = message;
        new_message.timestamp = new Date();
        messageRepository.save(new_message);
        await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);
        const user = await this.usersService.findById(me.id);
        const msg = Object.assign(Object.assign({}, new_message), { login42: user.login42, display_name: user.display_name });
        return msg;
    }
    async getMessagesByRoomId(room_id) {
        const my_query = await this.pool.query(`
			SELECT message.id, user_id, login42, display_name, message, timestamp
			FROM message
			JOIN public.user ON message.user_id=public.user.id
			WHERE room_id=${room_id}
			ORDER BY timestamp DESC;
			`);
        return my_query.rows;
    }
    async get_convs(me) {
        const blockedList = await this.listBlockedUsers(me.id);
        let room_query = await this.pool.query(`SELECT id, name, owner FROM room
			WHERE id IN (SELECT room_id FROM participants WHERE user_id = ${me.id})
			ORDER BY activity DESC`);
        const conversations = [];
        for (let i = 0; i < room_query.rowCount; i++) {
            let room_row = room_query.rows[i];
            let room_id = room_row.id;
            let part_q = await this.pool.query(`
				SELECT user_id FROM participants
				WHERE room_id = ${room_row.id}`);
            const type = room_row.owner ? 'group' : 'DM';
            let blocked;
            if (type === 'DM' && (blockedList.includes(part_q.rows[0].user_id) || blockedList.includes(part_q.rows[1].user_id)))
                blocked = true;
            let conv = {
                room_id,
                room_name: room_row.name,
                type,
                blocked,
                participants: []
            };
            for (let n = 0; n < part_q.rowCount; n++)
                conv.participants.push(part_q.rows[n].user_id);
            conversations.push(conv);
        }
        return conversations;
    }
    async roomInfo(room_id) {
        const query = await this.pool.query(`
			SELECT name, private, owner, password
			FROM room
			WHERE id = ${room_id};`);
        const info = query.rows[0];
        const is_group = !!info.owner;
        const userIDs = await this.listRoomParticipants(room_id);
        const roles = ['participant', 'admin', 'owner'];
        const users = [];
        for (let user_id of userIDs) {
            users.push({
                user_id,
                role: is_group ? roles[await this.get_role(user_id, room_id)] : undefined,
                muted: is_group ? await this.is_muted(user_id, room_id) : undefined,
            });
        }
        return {
            room_id: room_id,
            room_name: info.name,
            type: is_group ? 'group' : 'DM',
            blocked: !is_group ?
                await this.is_blocked(users[0].user_id, users[1].user_id) : undefined,
            private: info.private,
            password_protected: !!info.password,
            users
        };
    }
    async postDM(me, toId, msg) {
        if (me.id === toId)
            throw new common_1.BadRequestException("You shall not talk to yourself");
        if (await this.is_blocked(me.id, toId))
            throw new common_1.ForbiddenException('You are blocked by the user OR the user is blocked by you');
        let room_id = await this.get_dm_room(me, toId);
        if (!room_id)
            room_id = await this.create_dm_room(me, toId);
        return this.send_msg_to_room(me, room_id, msg);
    }
    async postDMbyRoomId(me, room_id, msg) {
        const room_members = await this.listRoomParticipants(room_id);
        if (!room_members.includes(me.id))
            throw new common_1.ForbiddenException("user is not a member of this DM room");
        const toId = room_members.find(user_id => user_id !== me.id);
        if (await this.is_blocked(me.id, toId))
            throw new common_1.ForbiddenException('You are blocked by the user OR the user is blocked by you');
        return this.send_msg_to_room(me, room_id, msg);
    }
    async get_dm_room(me, friend_id) {
        const dm_room = await this.pool.query(`
			SELECT id FROM room
			JOIN participants ON id=room_id
			WHERE id IN
				(SELECT id from room
				JOIN participants ON id=room_id
				WHERE owner IS NULL
				AND user_id=${me.id})
			AND user_id=${friend_id};`);
        if (!dm_room.rowCount)
            return null;
        return dm_room.rows[0].id;
    }
    async create_dm_room(me, friend_id) {
        const tmp = await this.pool.query(`SELECT login42 FROM public.user WHERE id= ${friend_id}`);
        if (!tmp.rowCount) {
            throw new common_1.BadRequestException("user does not exist");
        }
        const login42 = tmp.rows[0].login42;
        const query = await this.pool.query(`INSERT INTO room(name) VALUES('${me.login42}-${login42}')
			RETURNING id;`);
        let new_room_id = query.rows[0].id;
        await this.pool.query(`INSERT INTO participants (user_id, room_id)
			VALUES(${me.id}, ${new_room_id})`);
        await this.pool.query(`INSERT INTO participants (user_id, room_id)
			VALUES(${friend_id}, ${new_room_id})`);
        return (new_room_id);
    }
    async getDMbyUser(me, user_id) {
        if (me.id === user_id)
            throw new common_1.BadRequestException("No talking to yourself, plz...");
        const room_id = await this.get_dm_room(me, user_id);
        if (!room_id)
            return [];
        return this.getMessagesByRoomId(room_id);
    }
    async getDMsByRoomID(me, room_id) {
        if (!await this.is_room_participant(me.id, room_id))
            throw new common_1.ForbiddenException("you're not part of this DM room");
        return this.getMessagesByRoomId(room_id);
    }
    async block_user(me, block_id) {
        if (me.id === block_id)
            throw new common_1.BadRequestException("blocking yourself... that's kinda weird");
        await this.pool.query(`INSERT INTO blocked(user_id, blocked_id)
			VALUES(${me.id}, ${block_id})
			ON CONFLICT DO NOTHING`);
    }
    async unblock_user(me, block_id) {
        await this.pool.query(`DELETE FROM blocked WHERE blocked_id=${block_id} and user_id=${me.id}`);
    }
    async postGroupMsg(me, room_id, message) {
        if (!await this.is_room_participant(me.id, room_id))
            throw new common_1.ForbiddenException('user is not a group member');
        if (await this.is_muted(me.id, room_id))
            throw new common_1.ForbiddenException('user is muted');
        return this.send_msg_to_room(me, room_id, message);
    }
    async getGroupMessages(me, room_id) {
        if (!await this.is_room_participant(me.id, room_id))
            throw new common_1.ForbiddenException('not a group member');
        return this.getMessagesByRoomId(room_id);
    }
    async create_group(me, group) {
        if (await this.groupNameExists(group.name))
            throw new common_1.BadRequestException('group name already taken');
        const query = await this.pool.query(`
			INSERT INTO room (name, owner, activity)
			VALUES('${group.name}', ${me.id}, NOW())
			RETURNING id`);
        const room_id = query.rows[0].id;
        await this.pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${me.id}, ${room_id})`);
        if (group.password)
            await this.set_password(me, room_id, group.password);
        if (group.private === false)
            await this.set_private(me, room_id, false);
        return room_id;
    }
    async rm_group(me, room_id) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("you must be the group owner to remove it");
        await this.pool.query(`DELETE FROM message WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM banned WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM room WHERE id=${room_id}`);
    }
    async addGroupUser(me, room_id, user_id) {
        const role = await this.get_role(me.id, room_id);
        if (role < ADMIN)
            throw new common_1.ForbiddenException("no admin rights");
        if (await this.is_room_participant(user_id, room_id))
            throw new common_1.BadRequestException("user is already in the room");
        if (await this.is_banned(user_id, room_id))
            throw new common_1.ForbiddenException("user is banned. (unban it first)");
        await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
    }
    async addGroupUserRoot(room_id, user_id) {
        if (!(await this.listGroups()).includes(room_id))
            return;
        if (await this.is_room_participant(user_id, room_id))
            return;
        if (await this.is_banned(user_id, room_id))
            return;
        await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
    }
    set_unban_timer(room_id, user_id, time_minutes) {
        setTimeout(() => {
            this.addGroupUserRoot(room_id, user_id);
        }, time_minutes * 60 * 1000);
    }
    async ban_group_user(me, room_id, user_id, ban_minutes) {
        if (!await this.is_room_participant(user_id, room_id))
            throw new common_1.BadRequestException("user is not in group");
        let role1 = await this.get_role(me.id, room_id);
        let role2 = await this.get_role(user_id, room_id);
        if (role1 < ADMIN || role1 <= role2)
            throw new common_1.ForbiddenException("insufficient rights");
        let unban_date = new Date(new Date().getTime() + ban_minutes * 60000);
        await this.pool.query(`DELETE FROM participants WHERE user_id=${user_id} AND room_id=${room_id}`);
        await this.pool.query(`DELETE FROM banned WHERE banned_id=${user_id} AND room_id=${room_id} AND mute=true`);
        await this.pool.query(`INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role) VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unban_date.getTime() / 1000}), false, ${role1})`);
        this.set_unban_timer(room_id, user_id, ban_minutes);
    }
    async unban_group_user(me, room_id, user_id) {
        let role = await this.get_role(me.id, room_id);
        if (role < ADMIN)
            throw new common_1.ForbiddenException("insufficient rights");
        if (!await this.is_banned(user_id, room_id))
            throw new common_1.BadRequestException("user is not banned from this group");
        await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}
			AND mute=false
			;`);
        await this.addGroupUserRoot(room_id, user_id);
    }
    async mute_user(me, room_id, user_id, mute_minutes) {
        let role1 = await this.get_role(me.id, room_id);
        let role2 = await this.get_role(user_id, room_id);
        if (role1 < ADMIN || role1 <= role2)
            throw new common_1.ForbiddenException("insufficient rights");
        let unmute_date = new Date(new Date().getTime() + mute_minutes * 60000);
        await this.pool.query(`
			INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role)
			VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unmute_date.getTime() / 1000}), true, ${role1})`);
    }
    async unmute_user(me, room_id, user_id) {
        let role = await this.get_role(me.id, room_id);
        if (role < ADMIN)
            throw new common_1.ForbiddenException("no admin rights");
        await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}
			AND mute=true
			;`);
    }
    async add_admin_group(me, room_id, user_id) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("no owner rights");
        await this.pool.query(`
			INSERT INTO admins(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
    }
    async rm_admin_group(me, room_id, user_id) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("no owner rights");
        await this.pool.query(`
			DELETE FROM admins
			WHERE user_id=${user_id}
			AND room_id=${room_id}`);
    }
    async set_password(me, room_id, password) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("no owner rights");
        if (!password)
            return this.pool.query(`
				UPDATE room
				SET password=NULL
				WHERE id=${room_id}`);
        await this.pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);
        return this.pool.query(`
			UPDATE room
			SET password=crypt('${password}', gen_salt('bf')) 
			WHERE id=${room_id}`);
    }
    async set_private(me, room_id, cond) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("no owner rights");
        return this.pool.query(`
			UPDATE room SET private=${cond}
			WHERE id=${room_id}`);
    }
    async set_owner(me, room_id, user_id) {
        if (await this.get_role(me.id, room_id) != OWNER)
            throw new common_1.ForbiddenException("no owner rights");
        if (!await this.is_room_participant(user_id, room_id))
            throw new common_1.BadRequestException("user is not a participant in the room");
        await this.pool.query(`UPDATE room SET owner=${user_id} WHERE id=${room_id}`);
        await this.pool.query(`INSERT INTO admins(user_id, room_id) VALUES(${me.id}, ${room_id})`);
        await this.pool.query(`DELETE FROM admins WHERE user_id=${user_id} AND room_id=${room_id}`);
    }
    async check_password_match(room_id, password) {
        await this.pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);
        const query = await this.pool.query(`
			SELECT (password = crypt('${password}', password))
			AS pswmatch
			FROM room
			WHERE id = ${room_id};`);
        return query.rows[0].pswmatch;
    }
    async join_public_group(me, room_id, password) {
        if (await this.is_group_private(room_id))
            throw new common_1.ForbiddenException("private group, buddy");
        if (await this.is_room_participant(me.id, room_id))
            throw new common_1.BadRequestException("user is already in the room");
        if (await this.is_banned(me.id, room_id))
            throw new common_1.ForbiddenException("user is banned from group");
        if (await this.is_group_pswd_protected(room_id) &&
            !await this.check_password_match(room_id, password))
            throw new common_1.ForbiddenException("bad password");
        await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${me.id}, ${room_id})`);
    }
    async leave_group(me, room_id) {
        let participants = await this.listRoomParticipants(room_id);
        participants = participants.filter((value) => value !== me.id);
        if (!participants.length) {
            await this.pool.query(`DELETE FROM admins		WHERE room_id =	${room_id}`);
            await this.pool.query(`DELETE FROM banned		WHERE room_id =	${room_id}`);
            await this.pool.query(`DELETE FROM participants	WHERE room_id =	${room_id}`);
            await this.pool.query(`DELETE FROM message		WHERE room_id =	${room_id}`);
            await this.pool.query(`DELETE FROM room			WHERE id =		${room_id}`);
            return;
        }
        if (await this.get_role(me.id, room_id) != OWNER) {
            await this.pool.query(`
				DELETE FROM participants
				WHERE user_id=${me.id}
				AND room_id=${room_id}`);
            return;
        }
        for (let i = 0; i < participants.length; i++) {
            if (await this.get_role(participants[i], room_id) == ADMIN) {
                await this.pool.query(`UPDATE room SET owner=${participants[i]} WHERE id=${room_id}`);
                await this.pool.query(`DELETE FROM admins WHERE user_id=${participants[i]} AND room_id=${room_id}`);
                await this.pool.query(`DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`);
                return;
            }
        }
        await this.pool.query(`UPDATE room SET owner=${participants[0]} WHERE id=${room_id}`);
        await this.pool.query(`DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`);
    }
    async showPublicRooms() {
        const public_groups = await this.listPublicGroups();
        const info_array = [];
        for (let room_id of public_groups)
            info_array.push(await this.roomInfo(room_id));
        return info_array;
    }
    async is_muted(user_id, room_id) {
        const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = true
			AND unban > NOW();
		`);
        if (query.rowCount)
            return true;
        return false;
    }
    async is_banned(user_id, room_id) {
        const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = false
			AND unban > NOW();
		`);
        if (query.rowCount)
            return true;
        return false;
    }
    async is_room_participant(user_id, room_id) {
        const query = await this.pool.query(`
			SELECT * FROM participants
			WHERE room_id=${room_id}
			AND user_id=${user_id};
		`);
        return !!query.rowCount;
    }
    async is_blocked(my_id, other_user_id) {
        return ((await this.listBlockedUsers(my_id)).includes(other_user_id));
    }
    async get_role(id, room_id) {
        let tmp = await this.pool.query(`SELECT owner FROM room WHERE id=${room_id}`);
        if (tmp.rows[0].owner == id)
            return OWNER;
        tmp = await this.pool.query(`SELECT user_id FROM admins WHERE room_id=${room_id}`);
        {
            for (let i = 0; i < tmp.rowCount; i++)
                if (tmp.rows[i].user_id == id)
                    return ADMIN;
        }
        tmp = await this.pool.query(`SELECT user_id FROM participants WHERE room_id=${room_id}`);
        {
            for (let i = 0; i < tmp.rowCount; i++)
                if (tmp.rows[i].user_id == id)
                    return PARTICIPANT;
        }
        return -1;
    }
    async isBlockedDMroom(room_id) {
        const room_info = await this.roomInfo(room_id);
        if (room_info.type !== 'DM')
            return false;
        return this.is_blocked(room_info.users[0].user_id, room_info.users[1].user_id);
    }
    async groupNameExists(group_name) {
        const query = await this.pool.query(`
			SELECT * FROM room
			WHERE name = '${group_name}';`);
        return !!query.rowCount;
    }
    async isDmRoom(room_id) {
        const query = await this.pool.query(`
			SELECT owner FROM room
			WHERE id=${room_id};
		`);
        return !query.rows[0].owner;
    }
    async isGroupRoom(room_id) {
        return !await this.isDmRoom(room_id);
    }
    async is_group_private(room_id) {
        const query = await this.pool.query(`
			SELECT private FROM room
			WHERE id = ${room_id};`);
        return query.rows[0].private;
    }
    async is_group_pswd_protected(room_id) {
        const query = await this.pool.query(`
			SELECT (password IS NOT NULL)
			AS protected FROM room
			WHERE id = ${room_id};`);
        return query.rows[0].protected;
    }
    async listRooms() {
        const query = await this.pool.query(`
			SELECT id FROM room;
		`);
        const rooms = [];
        for (let i = 0; i < query.rowCount; ++i)
            rooms.push(query.rows[i].id);
        return rooms;
    }
    async listGroups() {
        const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL;
		`);
        return query.rows.map(obj => obj.id);
    }
    async listPublicGroups() {
        const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL
			AND private=false;
		`);
        return query.rows.map(obj => obj.id);
    }
    async listRoomParticipants(room_id) {
        const query = await this.pool.query(`SELECT user_id FROM participants
			WHERE room_id=${room_id};
			`);
        const res = [];
        for (let i = 0; i < query.rowCount; i++) {
            res.push(query.rows[i].user_id);
        }
        return res;
    }
    async listBlockedUsers(my_id) {
        let my_query = await this.pool.query(`SELECT blocked_id FROM blocked WHERE user_id=${my_id}
			UNION SELECT user_id FROM blocked WHERE blocked_id=${my_id}`);
        const blocked = [];
        for (let i = 0; i < my_query.rowCount; i++)
            blocked.push(my_query.rows[i].blocked_id);
        return blocked;
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Connection,
        users_service_1.UsersService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map