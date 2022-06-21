export declare class Conversation {
    room_id: number;
    room_name: string;
    type: string;
    participants: number[];
    constructor(room_id: number, room_name: string, type: string);
}
export declare class Session {
    id: number;
    login42: string;
    selected_room?: number;
    blocked?: number[];
    messages?: any[];
    conversations?: Conversation[];
}
