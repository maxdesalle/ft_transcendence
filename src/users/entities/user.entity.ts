import { DatabaseFile } from "src/database-files/entities/databaseFile.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(() => DatabaseFile, {nullable: true})
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;

	@Column({ default: false })
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret?: string;
}
