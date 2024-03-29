import { Component, For } from 'solid-js';
import { useStore } from '../store/StoreProvider';
import { RoomInfo } from '../types/chat.interface';
import { TiGroup } from 'solid-icons/ti';

const RoomList: Component<{ room: RoomInfo[]; keyword: string }> = (props) => {
  const [state, { setCurrentRoomId, setShowMessages }] = useStore();
  let ref: any;

  return (
    <div ref={ref}>
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
          <ul
            onClick={() => {
              setCurrentRoomId(room.room_id);
              setShowMessages(true);
            }}
            class="menu bg-base-100 items-center lg:items-start"
          >
            <li class="lg:w-full">
              <a classList={{ active: state.chat.roomId === room.room_id }}>
                <TiGroup size={24} />
                <p class="font-bold hidden lg:block">{room.room_name}</p>
              </a>
            </li>
          </ul>
        )}
      </For>
    </div>
  );
};

export default RoomList;
