export interface RoomConfig {
    name: string;
    private?: boolean;
    password?: boolean;
}
export interface RoomInfoShort {
    room_id: number;
    room_name: string;
    type: string;
    participants: number[];
}
export interface Message {
    id: number;
    user_id: number;
    message: string;
    timestamp: Date;
    room_id?: number;
    chosen_name: string;
}
