import { RoomInfoShort } from "../types/chat";
declare const ChatInput: ({ room, onSend, }: {
    room?: RoomInfoShort;
    onSend: (msg: string) => void;
}) => JSX.Element;
export default ChatInput;
