import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room.entity";

@Entity()
export class Admins {
	@PrimaryGeneratedColumn()
	pk: number;

	@ManyToOne(() => Room)
	@JoinColumn({ name: 'room_id'})
	room_id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id'})
	user_id: number;
}