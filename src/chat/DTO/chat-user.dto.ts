//this should probably not be a DTO

export class Conversation {
	participants: number[]
	constructor(
		public room_id: number,
		public room_name: string,
		public status: boolean
	) {
		this.participants = [];
	}
}

export class Session {
	id: number;
	username: string;
	selected_room?: number;
	blocked?: number[];
	messages?: any[]; // change this later to correct datatype
	conversations?: Conversation[]
}

export interface userJwtPayload {
	id: number;
	username: string;
	selected_room: number;
}

export class chatUserDB {
	id: number;
	name: string;
	status: boolean;
}

export class GroupConfig {
	name: string;
	private?: boolean;
	password?: string;
}
