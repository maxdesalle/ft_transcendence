import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room.entity";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Room)
	@JoinColumn({ name: 'room_id'})
	room_id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id'})
	user_id: number;

	@Column({
		type: 'text'
	})
	message: string
	
	@Column({
		type: "timestamptz",
		precision: 3,
	})
	timestamp: Date
}