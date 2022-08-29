import autoAnimate from '@formkit/auto-animate';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { Component, For, onMount, Show } from 'solid-js';
import { useStore } from '../store/all';
import { RoomInfo } from '../types/chat.interface';

const RoomList: Component<{ room: RoomInfo[]; keyword: string }> = (props) => {
  const [state, { setCurrentRoomId }] = useStore();
  let ref: any;

  onMount(() => {
    autoAnimate(ref);
  });

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
          <div
            onClick={() => {
              setCurrentRoomId(room.room_id);
            }}
            class="flex p-2 items-center"
            classList={{
              'border-y-2': state.chat.roomId === room.room_id,
              'border-gray-700': state.chat.roomId === room.room_id,
            }}
          >
            <HiSolidUserGroup color="#2564eb" size={24} />
            <div class="pl-2 text-white hover:text-slate-400 transition-all">
              <p class="font-bold first-letter:capitalize">{room.room_name}</p>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default RoomList;
