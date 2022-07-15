export class MatchDTO {
	id: number;
	p1Score: number;
	p2Score: number;
	timestamp: Date;
	p1: {user_id: number, display_name: string};
	p2: {user_id: number, display_name: string};
}

export class MatchResultDto {
    match_id: number;
    result: string;
    opponent: {
        user_id: number;
        display_name: string;
    };
    score: string;
    timestamp: Date;
}

export class PlayerStatsDto {
    ladder_rank: number;
    points: any;
    matches_played: number;
    wins: number;
    losses: number;
    wins_percent: number;
}

export class LadderDto {
    rank: number;
    user_id: any;
    display_name: any;
    points: any;
}

// for testing purposes
export class PostMatchDto {
	p1: number;
	p2: number;
	p1Score: number;
	p2Score: number;
}

export class LadderRankDto {
    ladder_rank: number;
    points: any;
}
