import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { DataSource, EntityManager } from 'typeorm';
import {
  BannedUser,
  GroupConfigDto,
  MessageDTO,
  RoomInfo,
} from './DTO/chat.dto';
import { Message } from './entities/message.entity';

const PARTICIPANT = 0;
const ADMIN = 1;
const OWNER = 2;

// adapts typeORM's EntityManager.query results to pq.Pool.query results format
// so I can use dszklarz's code without too many changes
class queryAdaptor {
  constructor(private manager: EntityManager) {}

  async query(sql_query: string) {
    const result = await this.manager.query(sql_query);
    return {
      rowCount: result.length,
      rows: result,
    };
  }
}

@Injectable()
export class ChatService {
  pool: queryAdaptor;

  constructor(
    private dataSource: DataSource,
    private usersService: UsersService,
  ) {
    this.pool = new queryAdaptor(dataSource.manager);
  }

  async send_msg_to_room(me: User, room_id: number, message: string) {
    // in order to allow messages containing single quotes, I'm not using the
    // raw query on this one.
    const messageRepository = this.dataSource.getRepository(Message);
    const new_message = new Message();
    new_message.room_id = room_id;
    new_message.user_id = me.id;
    new_message.message = message;
    new_message.timestamp = new Date();
    messageRepository.save(new_message);

    await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);

    const user = await this.usersService.findById(me.id);
    const msg: MessageDTO = {
      ...new_message,
      login42: user.login42,
      display_name: user.display_name,
    };
    return msg;
  }

  async getMessagesByRoomId(room_id: number): Promise<MessageDTO[]> {
    const my_query = await this.pool.query(`
			SELECT message.id, user_id, login42, display_name, message, timestamp
			FROM message
			JOIN public.user ON message.user_id=public.user.id
			WHERE room_id=${room_id}
			ORDER BY timestamp DESC;
			`);
    return my_query.rows;
  }

  async get_convs(me: User): Promise<RoomInfo[]> {
    const room_query = await this.pool.query(
      `SELECT id FROM room
			WHERE id IN (SELECT room_id FROM participants WHERE user_id = ${me.id})
			ORDER BY activity DESC`,
    );
    const conversations: RoomInfo[] = [];
    for (const room of room_query.rows) {
      conversations.push(await this.roomInfo(room.id));
    }
    // for (let i = 0; i < room_query.rowCount; i++) //for every conversation
    // {
    // 	let room_row = room_query.rows[i];
    // 	let room_id = room_row.id;
    // 	let part_q = await this.pool.query(`
    // 		SELECT id, login42, display_name, "avatarId"
    // 		FROM participants
    // 		JOIN public.user ON user_id = public.user.id
    // 		WHERE room_id = ${room_row.id}`
    // 	);
    // 	const type = room_row.owner ? 'group':'DM'
    // 	let blocked: boolean;
    // 	if (type === 'DM' && (blockedList.includes(part_q.rows[0].user_id) || blockedList.includes(part_q.rows[1].user_id)))
    // 		blocked = true;
    // 	let conv = {
    // 		room_id,
    // 		room_name: room_row.name,
    // 		type,
    // 		blocked,
    // 		participants: [],
    // 		last_msg: null
    // 	}
    // 	for (let n = 0; n < part_q.rowCount; n++) //get all participants of a given conversation
    // 		conv.participants.push(part_q.rows[n]);
    // 	const last_msg = await this.getMessagesByRoomId(room_row.id);
    // 	if (last_msg.length)
    // 		conv.last_msg = last_msg[0];
    // 	conversations.push(conv);
    // }
    return conversations;
  }

  async roomInfo(room_id: number): Promise<RoomInfo> {
    // get room info
    const query = await this.pool.query(`
			SELECT name, private, owner, password
			FROM room
			WHERE id = ${room_id};`);
    const info = query.rows[0];
    const is_group = !!info.owner;

    // get users
    const users = (
      await this.pool.query(`
			SELECT public.user.id, login42, display_name, "avatarId" FROM participants
			JOIN public.user ON user_id=public.user.id
			WHERE room_id=${room_id};	
		`)
    ).rows;

    // get their roles
    const roles: string[] = ['participant', 'admin', 'owner'];
    if (is_group) {
      for (const user of users) {
        user.role = roles[await this.get_role(user.id, room_id)];
        user.muted = await this.is_muted(user.id, room_id);
      }
    }

    // get last msg
    let last_msg: MessageDTO;
    const msgs = await this.getMessagesByRoomId(room_id);
    if (msgs.length) last_msg = msgs[0];

    return {
      room_id: room_id,
      room_name: info.name,
      type: is_group ? 'group' : 'DM',
      blocked: !is_group
        ? await this.is_blocked(users[0].id, users[1].id)
        : undefined,
      private: is_group ? info.private : undefined,
      password_protected: is_group ? !!info.password : undefined,
      users,
      last_msg,
    };
  }

  // ============= DM ==================

  // assumes valid user in toId
  async postDM(me: User, toId: number, msg: string) {
    // checks
    if (me.id === toId)
      throw new BadRequestException('You shall not talk to yourself');
    if (await this.is_blocked(me.id, toId))
      throw new ForbiddenException(
        'You are blocked by the user OR the user is blocked by you',
      );

    // check if dm_room already exists
    let room_id = await this.get_dm_room(me, toId);
    if (!room_id)
      // create room if necessary
      room_id = await this.create_dm_room(me, toId);

    return this.send_msg_to_room(me, room_id, msg);
  }

  // room_id is assumed to be valid DM room
  // for compability. prefer postDM.
  async postDMbyRoomId(me: User, room_id: number, msg: string) {
    // check if you're part of this DM room
    const room_members = await this.listRoomParticipants(room_id);
    if (!room_members.includes(me.id))
      throw new ForbiddenException('user is not a member of this DM room');
    const toId = room_members.find((user_id) => user_id !== me.id);
    // check if blocked
    if (await this.is_blocked(me.id, toId))
      throw new ForbiddenException(
        'You are blocked by the user OR the user is blocked by you',
      );

    return this.send_msg_to_room(me, room_id, msg);
  }

  // returns room_id of dm room between user, null if non-existant
  async get_dm_room(me: User, friend_id: number): Promise<null | number> {
    const dm_room = await this.pool.query(`
			SELECT id FROM room
			JOIN participants ON id=room_id
			WHERE id IN
				(SELECT id from room
				JOIN participants ON id=room_id
				WHERE owner IS NULL
				AND user_id=${me.id})
			AND user_id=${friend_id};`);
    if (!dm_room.rowCount) return null;
    return dm_room.rows[0].id;
  }

  // returns id of created room
  async create_dm_room(me: User, friend_id: number) {
    // get username
    const tmp = await this.pool.query(
      `SELECT login42 FROM public.user WHERE id= ${friend_id}`,
    );
    if (!tmp.rowCount) {
      throw new BadRequestException('user does not exist');
    }
    const login42: string = tmp.rows[0].login42;

    // create room
    const query = await this.pool.query(
      `INSERT INTO room(name) VALUES('${me.login42}-${login42}')
			RETURNING id;`,
    );

    const new_room_id = query.rows[0].id;
    await this.pool.query(
      `INSERT INTO participants (user_id, room_id)
			VALUES(${me.id}, ${new_room_id})`,
    );
    await this.pool.query(
      `INSERT INTO participants (user_id, room_id)
			VALUES(${friend_id}, ${new_room_id})`,
    );
    return new_room_id;
  }

  async getDMbyUser(me: User, user_id: number): Promise<MessageDTO[]> {
    // checks
    if (me.id === user_id)
      throw new BadRequestException('No talking to yourself, plz...');

    const room_id = await this.get_dm_room(me, user_id);
    if (!room_id) return [];
    return this.getMessagesByRoomId(room_id);
  }

  // assumes room_id is a DM room
  async getDMsByRoomID(me: User, room_id: number) {
    if (!(await this.is_room_participant(me.id, room_id)))
      throw new ForbiddenException("you're not part of this DM room");
    return this.getMessagesByRoomId(room_id);
  }

  async block_user(me: User, block_id: number) {
    if (me.id === block_id)
      throw new BadRequestException("blocking yourself... that's kinda weird");
    await this.pool.query(
      `INSERT INTO blocked(user_id, blocked_id)
			VALUES(${me.id}, ${block_id})
			ON CONFLICT DO NOTHING`,
    );
  }

  async unblock_user(me: User, block_id: number) {
    await this.pool.query(
      `DELETE FROM blocked WHERE blocked_id=${block_id} and user_id=${me.id}`,
    );
  }

  // ================= GROUP MESSAGES ==========================

  // valid room_id is assumed
  async postGroupMsg(me: User, room_id: number, message: string) {
    // checks
    if (!(await this.is_room_participant(me.id, room_id)))
      throw new ForbiddenException('user is not a group member');
    if (await this.is_muted(me.id, room_id))
      throw new ForbiddenException('user is muted');

    return this.send_msg_to_room(me, room_id, message);
  }

  // assumes valid group room
  async getGroupMessages(me: User, room_id: number) {
    // checks
    if (!(await this.is_room_participant(me.id, room_id)))
      throw new ForbiddenException('not a group member');

    return this.getMessagesByRoomId(room_id);
  }

  // ================= GROUP ADMIN TASKS ===========================

  async create_group(me: User, group: GroupConfigDto) {
    if (await this.groupNameExists(group.name))
      throw new BadRequestException('group name already taken');

    const query = await this.pool.query(`
			INSERT INTO room (name, owner, activity)
			VALUES('${group.name}', ${me.id}, NOW())
			RETURNING id`);

    const room_id = query.rows[0].id;
    await this.pool.query(
      `INSERT INTO participants(user_id, room_id) VALUES(${me.id}, ${room_id})`,
    );
    if (group.password) await this.set_password(me, room_id, group.password);
    if (group.private === false)
      // room is create private by default
      await this.set_private(me, room_id, false);
    return room_id;
  }

  async rm_group(me: User, room_id: number) {
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('you must be the group owner to remove it');

    await this.pool.query(`DELETE FROM message WHERE room_id=${room_id}`);
    await this.pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
    await this.pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
    await this.pool.query(`DELETE FROM banned WHERE room_id=${room_id}`);
    await this.pool.query(`DELETE FROM room WHERE id=${room_id}`);
  }

  /** add user to group. needs admin rights. */
  async addGroupUser(me: User, room_id: number, user_id: number) {
    // checks:
    // me must have admins
    const role = await this.get_role(me.id, room_id);
    if (role < ADMIN) throw new ForbiddenException('no admin rights');
    // user must not already be in the group
    if (await this.is_room_participant(user_id, room_id))
      throw new BadRequestException('user is already in the room');
    // user must not be banned from group
    if (await this.is_banned(user_id, room_id))
      throw new ForbiddenException('user is banned. (unban it first)');

    // add user
    await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
  }

  // to be called when someone gets unbanned
  // async addGroupUserRoot(room_id: number, user_id: number) {
  // 	// check if group still exists
  // 	if (!(await this.listGroups()).includes(room_id))
  // 		return;
  // 	// check if user already in group
  // 	if (await this.is_room_participant(user_id, room_id))
  // 		return;
  // 	// check if user is still banned
  // 	if (await this.is_banned(user_id, room_id))
  // 		return;

  // 	// add user
  // 	await this.pool.query(`
  // 		INSERT INTO participants(user_id, room_id)
  // 		VALUES(${user_id}, ${room_id})`);
  // }

  // set_unban_timer(room_id: number, user_id: number, time_minutes: number) {
  // 	setTimeout(() => {
  // 		this.addGroupUserRoot(room_id, user_id);
  // 	}, time_minutes * 60 * 1000);
  // }

  async ban_group_user(
    me: User,
    room_id: number,
    user_id: number,
    ban_minutes: number,
  ) {
    // check if user in the group
    if (!(await this.is_room_participant(user_id, room_id)))
      throw new BadRequestException('user is not in group');

    // check if you have more privileges than the user
    const role1 = await this.get_role(me.id, room_id);
    const role2 = await this.get_role(user_id, room_id);
    if (role1 < ADMIN || role1 <= role2)
      throw new ForbiddenException('insufficient rights');

    const unban_date = new Date(new Date().getTime() + ban_minutes * 60000);

    await this.pool.query(
      `DELETE FROM participants WHERE user_id=${user_id} AND room_id=${room_id}`,
    );
    await this.pool.query(
      `DELETE FROM banned WHERE banned_id=${user_id} AND room_id=${room_id} AND mute=true`,
    );
    await this.pool.query(
      `INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role) VALUES(${
        me.id
      }, ${user_id}, ${room_id}, to_timestamp(${
        unban_date.getTime() / 1000
      }), false, ${role1})`,
    );
    // this.set_unban_timer(room_id, user_id, ban_minutes);
  }

  async unban_group_user(me: User, room_id: number, user_id: number) {
    // checks
    // must be admin
    const role = await this.get_role(me.id, room_id);
    if (role < ADMIN) throw new ForbiddenException('insufficient rights');
    // user is banned from group
    if (!(await this.is_banned(user_id, room_id)))
      throw new BadRequestException('user is not banned from this group');

    // remove all ban entries from DB
    await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}
			AND mute=false
			;`);

    // reinsert in group
    // await this.addGroupUserRoot(room_id, user_id);
  }

  async mute_user(
    me: User,
    room_id: number,
    user_id: number,
    mute_minutes: number,
  ) {
    // check rights
    const role1 = await this.get_role(me.id, room_id);
    const role2 = await this.get_role(user_id, room_id);
    if (role1 < ADMIN || role1 <= role2)
      throw new ForbiddenException('insufficient rights');

    const unmute_date = new Date(new Date().getTime() + mute_minutes * 60000);

    await this.pool.query(`
			INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role)
			VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${
      unmute_date.getTime() / 1000
    }), true, ${role1})`);
  }

  async unmute_user(me: User, room_id: number, user_id: number) {
    const role = await this.get_role(me.id, room_id);
    if (role < ADMIN) throw new ForbiddenException('no admin rights');
    await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}
			AND mute=true
			;`);
  }

  async add_admin_group(me: User, room_id: number, user_id: number) {
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('no owner rights');
    await this.pool.query(`
			INSERT INTO admins(user_id, room_id)
			VALUES(${user_id}, ${room_id})`);
  }

  async rm_admin_group(me: User, room_id: number, user_id: number) {
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('no owner rights');
    await this.pool.query(`
			DELETE FROM admins
			WHERE user_id=${user_id}
			AND room_id=${room_id}`);
  }

  async set_password(me: User, room_id: number, password?: string) {
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('no owner rights');
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

  async set_private(me: User, room_id: number, cond: boolean) {
    //condition true = private false = public
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('no owner rights');
    return this.pool.query(`
			UPDATE room SET private=${cond}
			WHERE id=${room_id}`);
  }

  async set_owner(me: User, room_id: number, user_id: number) {
    if ((await this.get_role(me.id, room_id)) != OWNER)
      throw new ForbiddenException('no owner rights');
    if (!(await this.is_room_participant(user_id, room_id)))
      throw new BadRequestException('user is not a participant in the room');

    await this.pool.query(
      `UPDATE room SET owner=${user_id} WHERE id=${room_id}`,
    );
    await this.pool.query(
      `INSERT INTO admins(user_id, room_id) VALUES(${me.id}, ${room_id})`,
    );
    await this.pool.query(
      `DELETE FROM admins WHERE user_id=${user_id} AND room_id=${room_id}`,
    );
  }

  async check_password_match(room_id: number, password: string) {
    await this.pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);

    const query = await this.pool.query(`
			SELECT (password = crypt('${password}', password))
			AS pswmatch
			FROM room
			WHERE id = ${room_id};`);
    return query.rows[0].pswmatch;
  }

  // ====== JOIN / LEAVE GROUP ==================

  async join_public_group(me: User, room_id: number, password?: string) {
    // check if private
    if (await this.is_group_private(room_id))
      throw new ForbiddenException('private group, buddy');

    // check if user already in group
    if (await this.is_room_participant(me.id, room_id))
      throw new BadRequestException('user is already in the room');

    // check if banned
    if (await this.is_banned(me.id, room_id))
      throw new ForbiddenException('user is banned from group');

    // check if password protected && pswd match
    console.log(await this.is_group_pswd_protected(room_id));
    if (
      (await this.is_group_pswd_protected(room_id)) &&
      !(await this.check_password_match(room_id, password))
    )
      throw new ForbiddenException('bad password');

    // add to group
    await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${me.id}, ${room_id})`);
  }

  async leave_group(me: User, room_id: number) {
    let participants = await this.listRoomParticipants(room_id);
    // remove "me" from participants
    participants = participants.filter((value) => value !== me.id);
    if (!participants.length) {
      //last person in group
      await this.pool.query(`DELETE FROM admins		WHERE room_id =	${room_id}`);
      await this.pool.query(`DELETE FROM banned		WHERE room_id =	${room_id}`);
      await this.pool.query(
        `DELETE FROM participants	WHERE room_id =	${room_id}`,
      );
      await this.pool.query(`DELETE FROM message		WHERE room_id =	${room_id}`);
      await this.pool.query(`DELETE FROM room			WHERE id =		${room_id}`);
      return;
    }
    if ((await this.get_role(me.id, room_id)) != OWNER) {
      await this.pool.query(`
				DELETE FROM participants
				WHERE user_id=${me.id}
				AND room_id=${room_id}`);
      return;
    }
    for (
      let i = 0;
      i < participants.length;
      i++ //first admin in the list becomes owner
    ) {
      if ((await this.get_role(participants[i], room_id)) == ADMIN) {
        await this.pool.query(
          `UPDATE room SET owner=${participants[i]} WHERE id=${room_id}`,
        );
        await this.pool.query(
          `DELETE FROM admins WHERE user_id=${participants[i]} AND room_id=${room_id}`,
        );
        await this.pool.query(
          `DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`,
        );
        return;
      }
    }
    //first guy in the list becomes owner
    await this.pool.query(
      `UPDATE room SET owner=${participants[0]} WHERE id=${room_id}`,
    );
    await this.pool.query(
      `DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`,
    );
  }

  async showPublicRooms(): Promise<RoomInfo[]> {
    const public_groups = await this.listPublicGroups();
    const info_array: RoomInfo[] = [];
    for (const room_id of public_groups) {
      const room = await this.roomInfo(room_id);
      delete room.last_msg;
      info_array.push(room);
    }
    return info_array;
  }

  // ===== USER CHECKS ========================================

  async is_muted(user_id: number, room_id: number) {
    const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = true
			AND unban > NOW();
		`);
    if (query.rowCount) return true;
    return false;
  }

  async is_banned(user_id: number, room_id: number) {
    const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = false
			AND unban > NOW();
		`);
    if (query.rowCount) return true;
    return false;
  }

  async is_room_participant(user_id: number, room_id: number) {
    const query = await this.pool.query(`
			SELECT * FROM participants
			WHERE room_id=${room_id}
			AND user_id=${user_id};
		`);
    return !!query.rowCount;
  }

  // is one of the users blocked by the other one
  async is_blocked(my_id: number, other_user_id: number) {
    return (await this.listBlockedUsers(my_id)).includes(other_user_id);
  }

  async get_role(id: number, room_id: number) {
    let tmp = await this.pool.query(
      `SELECT owner FROM room WHERE id=${room_id}`,
    );
    if (tmp.rows[0].owner == id) return OWNER;
    tmp = await this.pool.query(
      `SELECT user_id FROM admins WHERE room_id=${room_id}`,
    );
    {
      for (let i = 0; i < tmp.rowCount; i++)
        if (tmp.rows[i].user_id == id) return ADMIN;
    }
    tmp = await this.pool.query(
      `SELECT user_id FROM participants WHERE room_id=${room_id}`,
    );
    {
      for (let i = 0; i < tmp.rowCount; i++)
        if (tmp.rows[i].user_id == id) return PARTICIPANT;
    }
    return -1;
  }

  // ====== ROOM CHECKS ===========================================

  async groupNameExists(group_name: string) {
    const query = await this.pool.query(`
			SELECT * FROM room
			WHERE name = '${group_name}';`);
    return !!query.rowCount;
  }

  async isDmRoom(room_id: number) {
    const query = await this.pool.query(`
			SELECT owner FROM room
			WHERE id=${room_id};
		`);
    return !query.rows[0].owner;
  }

  async isGroupRoom(room_id: number) {
    return !(await this.isDmRoom(room_id));
  }

  async is_group_private(room_id: number) {
    const query = await this.pool.query(`
			SELECT private FROM room
			WHERE id = ${room_id};`);
    return query.rows[0].private;
  }

  async is_group_pswd_protected(room_id: number) {
    const query = await this.pool.query(`
			SELECT (password IS NOT NULL)
			AS protected FROM room
			WHERE id = ${room_id};`);
    return query.rows[0].protected;
  }

  // ====== LISTS ============================

  /** DM and groups */
  async listRooms(): Promise<number[]> {
    const query = await this.pool.query(`
			SELECT id FROM room;
		`);
    const rooms = [];
    for (let i = 0; i < query.rowCount; ++i) rooms.push(query.rows[i].id);
    return rooms;
  }

  /** groups only */
  async listGroups(): Promise<number[]> {
    const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL;
		`);
    return query.rows.map((obj) => obj.id);
  }

  async listPublicGroups(): Promise<number[]> {
    const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL
			AND private=false;
		`);
    return query.rows.map((obj) => obj.id);
  }

  async listRoomParticipants(room_id: number): Promise<number[]> {
    const query = await this.pool.query(
      `SELECT user_id FROM participants
			WHERE room_id=${room_id};
			`,
    );
    const res = [];
    for (let i = 0; i < query.rowCount; i++) {
      res.push(query.rows[i].user_id);
    }
    return res;
  }

  /** list of users ID: blocked by you + blocked you */
  async listBlockedUsers(my_id: number): Promise<number[]> {
    const my_query = await this.pool.query(
      `SELECT blocked_id FROM blocked WHERE user_id=${my_id}
			UNION SELECT user_id FROM blocked WHERE blocked_id=${my_id}`,
    );
    const blocked = [];
    for (let i = 0; i < my_query.rowCount; i++)
      blocked.push(my_query.rows[i].blocked_id);
    return blocked;
  }

  async listBannedUsers(room_id: number): Promise<BannedUser[]> {
    const query = await this.pool.query(
      `SELECT u.id, u.login42, u.display_name, b.unban FROM
				(SELECT * FROM banned
			 	WHERE mute = FALSE
			 	AND room_id = ${room_id}
			 	AND unban > NOW()) b
		  	JOIN public.user u ON b.banned_id = u.id;`,
    );
    return query.rows;
  }
}
