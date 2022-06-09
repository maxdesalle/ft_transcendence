import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		unique: true
	})
	name: string;

	@Column({
		nullable: true
	})
	owner: number

	@Column({
		nullable: true,
		default: true
	})
	private: boolean

	@Column({
		nullable: true,
		type: "text"
	})
	password: string // actually, it's a pswd hash

	@Column({
		type: "timestamptz",
		precision: 3,
		nullable: true
	})
	activity: Date
}