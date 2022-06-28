import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Blocked {

	@PrimaryColumn()
	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id'})
	user_id: number;

	@PrimaryColumn()
	@ManyToOne(() => User)
	@JoinColumn({ name: 'blocked_id'})
	blocked_id: number;
}