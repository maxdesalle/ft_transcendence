export interface User {
  login42: string;
  display_name: string;
  id: number;
  avatarId: number;
  isTwoFactorAuthenticationEnabled: boolean;
}

export interface Friend {
  id: number;
  display_name: string;
  avatarId: number;
  status: 'online' | 'offline' | 'ingame';
}

export interface RoomUser extends User {
  role?: 'owner' | 'admin' | 'participant';
  muted?: string;
}
