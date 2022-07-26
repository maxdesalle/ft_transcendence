export interface User {
  login42: string;
  display_name: string;
  id: number;
  avatarId: number;
  isTwoFactorAuthenticationEnabled: boolean;
}

export interface RoomUser extends User {
  role?: string;
  muted?: string;
}