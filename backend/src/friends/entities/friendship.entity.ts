import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum FrienshipStatus {
	pending,
	accepted,
	rejected
}

@Entity()
export class Friendship {

	@PrimaryColumn()
	req_user_id: number;

	@PrimaryColumn()
	recv_user_id: number;

	@ManyToOne(() => User, (user) => user.requested_friendships)
	requesting_user: User;

	@ManyToOne(() => User, (user) => user.received_friendships)
	receiving_user: User;

	@Column({ default: FrienshipStatus.pending })
	status: FrienshipStatus
}
