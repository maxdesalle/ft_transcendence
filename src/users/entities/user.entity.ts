import { Exclude } from "class-transformer";
import { DatabaseFile } from "src/database-files/entities/databaseFile.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	name: string; // name chosen by the user

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(() => DatabaseFile, {nullable: true})
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;

	@Column({ default: false })
	@Exclude()
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	@Exclude()
	twoFactorAuthenticationSecret?: string;

	// for compability with Dszklarz's code
	@Column({ nullable: true })
	status: boolean
}
