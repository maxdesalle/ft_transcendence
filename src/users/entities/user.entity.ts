import { Exclude } from "class-transformer";
import { DatabaseFile } from "src/database-files/entities/databaseFile.entity";
import { Friendship } from "src/friends/entities/friendship.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	username: string; // 42 login

	@Column({ unique: true })
	chosen_name: string; // name chosen by the user

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(() => DatabaseFile, {nullable: true})
	avatar?: DatabaseFile;

	@Column({ nullable: true })
	avatarId?: number;

	@Column({ default: false })
	isTwoFactorAuthenticationEnabled: boolean;

	@Column({ nullable: true })
	@Exclude()
	twoFactorAuthenticationSecret?: string;

	// for compability with Dszklarz's code
	@Column({ nullable: true })
	status: boolean

	@OneToMany(() => Friendship, (friendship) => friendship.requesting_user)
	requested_friendships: Friendship[]

	@OneToMany(() => Friendship, (friendship) => friendship.receiving_user)
	received_friendships: Friendship[]
}
