import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;
}
