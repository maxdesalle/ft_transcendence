//this should probably not be a DTO

export class Conversation {
	participants: number[]
	constructor(
		public room_id: number,
		public room_name: string,
		// public status: boolean,
		public type: string
	) {
		this.participants = [];
	}
}

export class Session {
	id: number;
	login42: string;
	selected_room?: number;
	blocked?: number[];
	messages?: any[]; // change this later to correct datatype
	conversations?: Conversation[]
}

// export interface userJwtPayload {
// 	id: number;
// 	login42: string;
// 	selected_room: number;
// }

// export class chatUserDB {
// 	id: number;
// 	name: string;
// 	status: boolean;
// }

