import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsService } from 'src/websockets/ws.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Friendship, FrienshipStatus } from './entities/friendship.entity';

@Injectable()
export class FriendsService {
	constructor (
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Friendship)
		private friendsRepository: Repository<Friendship>,
		private usersService: UsersService,
		private wsService: WsService
	) {}

	// duplicate request is no problem
	async requestFriendship(my_id: number, user_id: number) {
		const me = await this.usersService.findById(my_id); 
		const friend = await this.usersService.findById(user_id); 
		if (!friend || my_id === user_id)
			throw new BadRequestException("bad user id");
		// check for the reverse request
		if (await this.friendsRepository.findOne({
			req_user_id: user_id,
			recv_user_id: my_id
		}))
			throw new BadRequestException('friendship request already exists');
		const friendship = new Friendship();
		friendship.requesting_user = me;
		friendship.req_user_id = my_id;
		friendship.receiving_user = friend;
		friendship.recv_user_id = user_id;
		return this.friendsRepository.save(friendship);
		// return this.pendingSentRequests(my_id); 
	}

	async sentRequests(my_id: number) {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['requested_friendships']
		});
		return me.requested_friendships;

		// return pending;
	} 

	async recvdRequests(my_id: number) {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['received_friendships']
		});
		return me.received_friendships;
	}

	async pendingSentRequests(my_id: number) {
		return (await this.sentRequests(my_id))
			.filter(f => f.status === FrienshipStatus.pending)
			.map(obj => obj.recv_user_id);
	}

	async pendingReceivedRequests(my_id: number) {
		return (await this.recvdRequests(my_id))
			.filter(f => f.status === FrienshipStatus.pending)
			.map(obj => obj.req_user_id);
	}

	async rejectedReceivedRequests(my_id: number) {
		return (await this.recvdRequests(my_id))
			.filter(f => f.status === FrienshipStatus.rejected)
			.map(obj => obj.req_user_id);
	}

	async setFriendshipStatus(my_id: number, requester_id: number, status: FrienshipStatus) {
		const request = await this.friendsRepository.findOne({
			recv_user_id: my_id,
			req_user_id: requester_id
		});
		if (!request)
			throw new BadRequestException("friendship request does not exist");
		request.status = status;
		return this.friendsRepository.save(request);
		// return this.listFriendsIDs(my_id);
	}

	async listFriendsIDs(my_id: number): Promise<number[]> {
		const me = await this.usersRepository.findOne(my_id, {
			relations: ['received_friendships', 'requested_friendships']
		});

		return [].concat(
			me.received_friendships
				.filter(f => f.status === FrienshipStatus.accepted)
				.map(obj => obj.req_user_id),
			me.requested_friendships
				.filter(f => f.status === FrienshipStatus.accepted)
				.map(obj => obj.recv_user_id),
		)
	}

	async listFriendsUsers(my_id: number) {
		const friends_ids = await this.listFriendsIDs(my_id);
		const users = await this.usersRepository.findByIds(friends_ids);
		users.forEach(user => user.statuss = this.getFriendStatus(user.id));
		return users;
	}

	// todo: add a FRIEND guard 
	getFriendStatus(friend_id: number): string {
		if (this.wsService.isUserConnected(friend_id))
			return 'online';
		return 'offline';
	}

}
