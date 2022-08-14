import { HiSolidUserGroup } from 'solid-icons/hi';
import { Component, For } from 'solid-js';
import { useStore } from '../store';
import { RoomInfo } from '../types/chat.interface';

const RoomList: Component<{ room: RoomInfo[]; keyword: string }> = (props) => {
  const [state, { setCurrentRoomId, toggleShowMessages }] = useStore();
  return (
    <For
      each={props.room.filter(
        (room) =>
          room.room_name
            .toLocaleLowerCase()
            .includes(props.keyword.toLocaleLowerCase()) &&
          room.type === 'group',
      )}
    >
      {(room) => (
        <div
          onClick={() => {
            setCurrentRoomId(room.room_id);
            if (!state.chatUi.showMessages) {
              toggleShowMessages();
            }
          }}
          class="flex p-2 items-center"
        >
          <HiSolidUserGroup color="#2564eb" size={24} />
          <div class="pl-2 text-white hover:text-slate-400 transition-all">
            <p class="font-bold first-letter:capitalize">{room.room_name}</p>
          </div>
        </div>
      )}
    </For>
  );
};

export default RoomList;
