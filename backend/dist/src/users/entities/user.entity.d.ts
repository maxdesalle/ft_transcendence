import { DatabaseFile } from "src/database-files/entities/databaseFile.entity";
import { Friendship } from "src/friends/entities/friendship.entity";
export declare class User {
    id: number;
    login42: string;
    display_name: string;
    avatar?: DatabaseFile;
    avatarId?: number;
    isTwoFactorAuthenticationEnabled: boolean;
    twoFactorAuthenticationSecret?: string;
    status: boolean;
    statuss?: string;
    requested_friendships: Friendship[];
    received_friendships: Friendship[];
}
