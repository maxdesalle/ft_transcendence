import { User } from './user.interface';

export interface GameSession {
  session_id: number;
  p1: Partial<User>;
  p2: Partial<User>;
}
