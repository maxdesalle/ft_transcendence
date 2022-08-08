import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Points {
	@PrimaryColumn()
	@JoinColumn({name: 'user_id'})
	@OneToOne(() => User)
	user_id: number;

	@Column({default: 0})
	points: number;
}
