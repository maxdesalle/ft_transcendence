import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsService } from 'src/ws/ws.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Friendship, FrienshipStatus as FriendshipStatus } from './entities/friendship.entity';
import { playing } from 'src/pong/pong.gateway';
import { FriendshipRecvUser, FriendshipRequest, FriendshipReqUser } from './dto/friendReq.dto';

@Injectable()
export class FriendsService {
	constructor (
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendsRepository: Repository<Friendship>,
		private usersService: UsersService,
		@Inject(forwardRef(() => WsService))
		private wsService: WsService
	) {}

	/** Converts a Friendship (entity) obj to a FriendshipRequest object */
	friendshipToFriendshipRequest(request: Friendship): FriendshipRequest {
		return {
			requesting_user: {
				id: request.requesting_user.id,
				display_name: request.requesting_user.display_name,
			},
			receiving_user: {
				id: request.receiving_user.id,
				display_name: request.receiving_user.display_name,
			},
			status: request.status,
		}
	}

	async requestFriendship(my_id: number, user_id: number): Promise<FriendshipRequest> {
		const me = await this.usersService.findById(my_id); 
		const friend = await this.usersService.findById(user_id); 
		if (!friend || my_id === user_id)
			throw new BadRequestException("bad user id");
		// check if request or the reverse one already exists
		if (await this.friendsRepository.findOne({
			req_user_id: user_id,
			recv_user_id: my_id})
			|| await this.friendsRepository.findOne({
			req_user_id: my_id,
			recv_user_id: user_id}))
			throw new BadRequestException('friendship request already exists');
		const request = new Friendship();
		request.requesting_user = me;
		request.req_user_id = my_id;
		request.receiving_user = friend;
		request.recv_user_id = user_id;
		await this.friendsRepository.save(request);
		return this.friendshipToFriendshipRequest(request);
	}

	async sentRequests(my_id: number): Promise<any> {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['requested_friendships']
		});
		return me.requested_friendships;

		// return pending;
	} 

	async recvdRequests(my_id: number): Promise<any> {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['received_friendships']
		});
		return me.received_friendships;
	}

	async pendingSentRequests(my_id: number): Promise<FriendshipRecvUser[]> {
		return (await this.sentRequests(my_id))
			.filter(f => f.status === FriendshipStatus.pending)
			.map(obj => {delete obj.req_user_id; return obj});
	}

	async pendingReceivedRequests(my_id: number): Promise<FriendshipReqUser[]> {
		return (await this.recvdRequests(my_id))
			.filter(f => f.status === FriendshipStatus.pending)
			.map(obj => {delete obj.recv_user_id; return obj});
	}

	async rejectedReceivedRequests(my_id: number): Promise<FriendshipReqUser[]>  {
		return (await this.recvdRequests(my_id))
			.filter(f => f.status === FriendshipStatus.rejected)
			.map(obj => {delete obj.recv_user_id; return obj});
	}

	async setFriendshipStatus(my_id: number, requester_id: number, status: FriendshipStatus) {
		const request = await this.friendsRepository.findOne({
			recv_user_id: my_id,
			req_user_id: requester_id
		}, {relations: ['requesting_user', 'receiving_user']});
		if (!request)
			throw new BadRequestException("friendship request does not exist");
		request.status = status;
		await this.friendsRepository.save(request);
		return this.friendshipToFriendshipRequest(request);
	}

	async listFriendsIDs(my_id: number): Promise<number[]> {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['received_friendships', 'requested_friendships']
		});

		return [].concat(
			me.received_friendships
				.filter(f => f.status === FriendshipStatus.accepted)
				.map(obj => obj.req_user_id),
			me.requested_friendships
				.filter(f => f.status === FriendshipStatus.accepted)
				.map(obj => obj.recv_user_id),
		)
	}

	async listFriendsUsers(my_id: number) {
		const friends_ids = await this.listFriendsIDs(my_id);
		const users = await this.usersRepository.findByIds(friends_ids);
		users.forEach(user => {
			user.status = this.getUserStatus(user.id);
			user.login42 = undefined;
			user.isTwoFactorAuthenticationEnabled = undefined;
		});
		return users;
	}

	getUserStatus(user_id: number): string {
		if (playing.has(user_id))
			return 'playing'
		if (this.wsService.isUserOnline(user_id))
			return 'online';
		return 'offline';
	}

}
