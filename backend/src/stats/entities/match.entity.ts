import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'player1'})
	player1: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'player2'})
	player2: number;

	@Column()
	p1Score: number;

	@Column()
	p2Score: number;

	@Column({
		type: "timestamptz"
	})
	timestamp: Date;
}
