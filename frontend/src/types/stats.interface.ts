export interface MatchDTO {
  id: number;
  p1Score: number;
  p2Score: number;
  timestamp: Date;
  p1: { user_id: number; display_name: string };
  p2: { user_id: number; display_name: string };
}

export interface LadderDto {
  rank: number;
  user_id: any;
  display_name: any;
  points: any;
}
