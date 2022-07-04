export class MatchDTO {
	id: number;
	p1Score: number;
	p2Score: number;
	timestamp: Date;
	p1: {user_id: number, display_name: string};
	p2: {user_id: number, display_name: string};
}

// for testing purposes
export class PostMatchDto {
	p1: number;
	p2: number;
	p1Score: number;
	p2Score: number;
}
