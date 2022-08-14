import { Component, createSignal, For } from 'solid-js';
import { RoomInfo } from '../types/chat.interface';
import JoinableRoomCard from './JoinableRoomCard';

const JoinableRoomList: Component<{
  rooms: RoomInfo[];
  refetch: () => void;
  keyword: string;
}> = (props) => {
  return (
    <For
      each={props.rooms.filter((room) =>
        room.room_name.toLowerCase().includes(props.keyword.toLowerCase()),
      )}
    >
      {(room) => <JoinableRoomCard refetch={props.refetch} room={room} />}
    </For>
  );
};

export default JoinableRoomList;
