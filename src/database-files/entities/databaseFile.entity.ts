import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DatabaseFile {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	filename: string;

	@Column({
		type: 'bytea',
	})
	data: Uint8Array;
}