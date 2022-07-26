import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room.entity";

@Entity()
export class Banned {
	@PrimaryGeneratedColumn()
	pk: number;

	@ManyToOne(() => Room)
	@JoinColumn({ name: 'room_id'})
	room_id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id'})
	user_id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'banned_id'})
	banned_id: number;

	@Column({
		type: "timestamptz",
		precision: 3,
		nullable: true
	})
	unban: Date

	@Column()
	mute: boolean

	@Column({
		nullable: true
	})
	role: number
}