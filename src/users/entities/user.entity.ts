import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column({ default: false })
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret?: string;
}
