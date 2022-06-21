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
const chat_user_dto_1 = require("./DTO/chat-user.dto");
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
    async sendDMtoUser(me, toId, msg) {
        if (me.id === toId)
            throw new common_1.BadRequestException("You shall not talk to yourself");
        let room_id = await this.get_dm_room(me, toId);
        if (!room_id)
            room_id = await this.create_dm_room(me, toId);
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
    async getDMbyUser(me, friend_id) {
        if (me.id === friend_id)
            throw new common_1.BadRequestException("No talking to yourself, plz...");
        const room_id = await this.get_dm_room(me, friend_id);
        if (!room_id)
            return [];
        return this.getMessagesByRoomId(me, room_id);
    }
    async getMessagesByRoomId(me, room_id) {
        const my_query = await this.pool.query(`
			SELECT message.id, user_id, login42, display_name, message, timestamp
			FROM message
			JOIN public.user ON message.user_id=public.user.id
			WHERE room_id=${room_id};`);
        return my_query.rows;
    }
    async send_dm(me, message) {
        await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`);
    }
    async get_blocked(me) {
        let my_query = await this.pool.query(`SELECT blocked_id FROM blocked WHERE user_id=${me.id}
			UNION SELECT user_id FROM blocked WHERE blocked_id=${me.id}`);
        const blocked = [];
        for (let i = 0; i < my_query.rowCount; i++)
            blocked.push(my_query.rows[i].blocked_id);
        return blocked;
    }
    async block(me, block_id) {
        if (me.id === block_id)
            throw new common_1.BadRequestException("blocking yourself... that's kinda weird");
        await this.pool.query(`INSERT INTO blocked(user_id, blocked_id)
			VALUES(${me.id}, ${block_id})
			ON CONFLICT DO NOTHING`);
    }
    async unblock(me, block_id) {
        await this.pool.query(`DELETE FROM blocked WHERE blocked_id=${block_id} and user_id=${me.id}`);
    }
    async getRoomParcipants(room_id) {
        const query = await this.pool.query(`SELECT user_id FROM participants
			WHERE room_id=${room_id};
			`);
        const res = [];
        for (let i = 0; i < query.rowCount; i++) {
            res.push(query.rows[i].user_id);
        }
        return res;
    }
    async get_convs(me) {
        const blocked = await this.get_blocked(me);
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
            if (!room_row.owner && (blocked.includes(part_q.rows[0].user_id) || blocked.includes(part_q.rows[1].user_id)))
                continue;
            const type = room_row.owner ? 'group' : 'DM';
            let tmp = new chat_user_dto_1.Conversation(room_id, room_row.name, type);
            for (let n = 0; n < part_q.rowCount; n++)
                tmp.participants.push(part_q.rows[n].user_id);
            conversations.push(tmp);
        }
        return conversations;
    }
    async getDMusersID(me) {
        const friends = await this.pool.query(`
			SELECT user_id FROM room
			JOIN participants ON id=room_id
			WHERE id IN
				(SELECT id from room
				JOIN participants ON id=room_id
				WHERE owner IS NULL
				AND user_id=${me.id})
			AND user_id!=${me.id};`);
        console.log(friends);
        return (friends.rows);
    }
    async rm_dm_room(me, friend_id) {
        const friend_room = await this.get_dm_room(me, friend_id);
        if (!friend_room)
            return console.log(`no conversation between ${me.id} and ${friend_id} in rm_friend`);
        await this.pool.query(`DELETE FROM message WHERE room_id= ${friend_room}`);
        await this.pool.query(`DELETE FROM participants WHERE room_id = ${friend_room}`);
        await this.pool.query(`DELETE FROM room WHERE id= ${friend_room}`);
    }
    async groupNameExists(group_name) {
        const query = await this.pool.query(`
			SELECT * FROM room
			WHERE name = '${group_name}';`);
        return !!query.rowCount;
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
            await this.set_password(room_id, group.password);
        if (group.private)
            await this.set_private(room_id, group.private);
        return room_id;
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
    async addGroupUser(me, room_id, user_id) {
        const participants = await this.getRoomParcipants(room_id);
        if (participants.includes(user_id))
            throw new common_1.BadRequestException("user is already in the room");
        let tmp = await this.pool.query(`
			SELECT role, banned_id FROM banned
			WHERE room_id=${room_id} AND banned_id=${user_id}`);
        if (tmp.rowCount) {
            let role1 = await this.get_role(me.id, room_id);
            let role2 = tmp.rows[0].role;
            if (role1 < role2)
                throw new common_1.ForbiddenException("not enough rights");
        }
        await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
    }
    async send_msg_to_room_ws(user_id, room_id, message) {
        await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${user_id}, NOW(), '${message}', ${room_id})`);
        await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);
    }
    async send_msg_to_room(me, room_id, message) {
        let tmp = await this.pool.query(`SELECT banned_id, unban FROM banned WHERE room_id= ${room_id}
			AND mute=true AND banned_id=${me.id}`);
        let now = await this.pool.query(`SELECT NOW()`);
        if (tmp.rowCount) {
            if (tmp.rows[0].unban < now.rows[0].now)
                await this.pool.query(`
					DELETE FROM banned WHERE banned_id=${me.id}
					AND mute=true AND room_id=${room_id}`);
            else
                throw new common_1.ForbiddenException("you are muted");
        }
        const query = await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${room_id})
			RETURNING *`);
        await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);
        const user = await this.usersService.findById(me.id);
        const msg = Object.assign(Object.assign({}, query.rows[0]), { login42: user.login42, display_name: user.display_name });
        return msg;
    }
    async getRoomsList() {
        const query = await this.pool.query(`
			SELECT id FROM room;
		`);
        const rooms = [];
        for (let i = 0; i < query.rowCount; ++i)
            rooms.push(query.rows[i].id);
        return rooms;
    }
    async getGroupsList() {
        const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL;
		`);
        const rooms = [];
        for (let i = 0; i < query.rowCount; ++i)
            rooms.push(query.rows[i].id);
        return rooms;
    }
    async groupExists(room_id) {
        const rooms = this.getGroupsList();
        return (await rooms).includes(room_id);
    }
    async rm_group(me, room_id) {
        await this.pool.query(`DELETE FROM message WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM banned WHERE room_id=${room_id}`);
        await this.pool.query(`DELETE FROM room WHERE id=${room_id}`);
    }
    async rm_user_group(me, room_id, user_id, unban_hours) {
        let role1 = await this.get_role(me.id, room_id);
        let role2 = await this.get_role(user_id, room_id);
        if (role1 < ADMIN || role1 <= role2)
            throw new common_1.ForbiddenException("insufficient rights");
        let unban_date = new Date;
        if (unban_hours > 0)
            unban_date.setHours(unban_date.getHours() + unban_hours);
        await this.pool.query(`DELETE FROM participants WHERE user_id=${user_id} AND room_id=${room_id}`);
        await this.pool.query(`DELETE FROM banned WHERE banned_id=${user_id} AND room_id=${room_id} AND mute=true`);
        await this.pool.query(`INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role) VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unban_date.getTime() / 1000}), false, ${role1})`);
    }
    async mute_user(me, room_id, user_id, unban_hours) {
        let role1 = await this.get_role(me.id, room_id);
        let role2 = await this.get_role(user_id, room_id);
        if (role1 < ADMIN || role1 <= role2)
            throw new common_1.ForbiddenException("insufficient rights");
        let unban_date = new Date;
        unban_date.setHours(unban_date.getHours() + unban_hours);
        await this.pool.query(`
			INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role)
			VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unban_date.getTime() / 1000}), true, ${role1})`);
    }
    async unmute_user(me, room_id, user_id) {
        let role1 = await this.get_role(me.id, room_id);
        let role2 = await this.get_role(user_id, room_id);
        if (role1 < ADMIN || role1 <= role2)
            throw new common_1.ForbiddenException("insufficient rights");
        await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}`);
    }
    async add_admin_group(me, room_id, user_id) {
        if (await this.get_role(me.id, room_id) == OWNER)
            await this.pool.query(`
				INSERT INTO admins(user_id, room_id)
				VALUES(${user_id}, ${room_id})`);
    }
    async rm_admin_group(me, room_id, user_id) {
        if (await this.get_role(me.id, room_id) == OWNER)
            await this.pool.query(`
				DELETE FROM admins
				WHERE user_id=${user_id}
				AND room_id=${room_id}`);
    }
    async is_muted(user_id, room_id) {
        const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = true;
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
			AND mute = false;
		`);
        if (query.rowCount)
            return true;
        return false;
    }
    async leave_group(me, room_id) {
        let participants = await this.getRoomParcipants(room_id);
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
    async set_password(room_id, password) {
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
    async set_private(room_id, cond) {
        return this.pool.query(`
			UPDATE room SET private=${cond}
			WHERE id=${room_id}`);
    }
    async set_owner(me, room_id, user_id) {
        const participants = await this.getRoomParcipants(room_id);
        if (!participants.includes(user_id))
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
    async is_group_private(room_id) {
        const query = await this.pool.query(`
			SELECT private FROM room
			WHERE id = ${room_id};`);
        return query.rows[0].private;
    }
    async roomInfo(room_id) {
        const userIDs = await this.getRoomParcipants(room_id);
        const roles = ['participant', 'admin', 'owner'];
        const users = [];
        for (let user_id of userIDs) {
            users.push({
                user_id,
                role: roles[await this.get_role(user_id, room_id)],
            });
        }
        const query = await this.pool.query(`
			SELECT name, private, owner, password
			FROM room
			WHERE id = ${room_id};`);
        const info = query.rows[0];
        return {
            room_id: room_id,
            room_name: info.name,
            type: info.owner ? 'group' : 'DM',
            private: info.private,
            password_protected: !!info.password,
            users
        };
    }
    async is_group_pswd_protected(room_id) {
        const query = await this.pool.query(`
			SELECT (password IS NOT NULL)
			AS protected FROM room
			WHERE id = ${room_id};`);
        return query.rows[0].protected;
    }
    async join_public_group(me, room_id, password) {
        if (await this.is_group_private(room_id))
            throw new common_1.ForbiddenException("private group, buddy");
        if (await this.is_group_pswd_protected(room_id) &&
            !await this.check_password_match(room_id, password))
            throw new common_1.ForbiddenException("bad password");
        const participants = await this.getRoomParcipants(room_id);
        if (participants.includes(me.id))
            throw new common_1.BadRequestException("user is already in the room");
        await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${me.id}, ${room_id})`);
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Connection,
        users_service_1.UsersService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map