//this should probably not be a DTO

export class Session {
	id: number;
	username: string;
	selected_room?: number;
	blocked?: number[];
	messages?: any[]; // change this later to correct datatype
}
