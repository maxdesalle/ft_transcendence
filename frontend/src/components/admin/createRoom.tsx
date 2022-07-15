import {
  Component,
  createEffect,
  createRenderEffect,
  createSignal,
} from 'solid-js';
import { chatApi } from '../../api/chat';
import { useStore } from '../../store';

function model(el: any, accessor: any) {
  const [s, set] = accessor();
  el.addEventListener('input', (e: any) => set(e.currentTarget.value));
  createRenderEffect(() => (el.value = s()));
}

const CreateRoom: Component<{ ref?: any }> = () => {
  const [roomName, setRoomName] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isPrivate, setIsPrivate] = createSignal(false);
  const [state, { updateRooms }] = useStore();

  const onCreateRoom = () => {
    if (!roomName().length) return;
    chatApi.createRoom({ name: roomName() }).then((res) => {
      if (updateRooms) {
        updateRooms(res.data);
      }
    });
    setRoomName('');
  };

  return (
    <div class="flex flex-col">
      <div>
        <input
          autocomplete="off"
          //@ts-ignore
          use:model={[roomName, setRoomName]}
          type="text"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_id"
          id="room_id"
          placeholder="Enter name"
        />
      </div>
      <div class="mt-2">
        <input
          autocomplete="off"
          //@ts-ignore
          use:model={[password, setPassword]}
          type="text"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_id"
          id="room_id"
          placeholder="Enter password"
        />
      </div>
      <div class="mt-2 flex items-center">
        <label class="pr-2 pl-1">Private?</label>
        <input
          autocomplete="off"
          aria-disabled
          //@ts-ignore
          use:model={[isPrivate, setIsPrivate]}
          type="radio"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_id"
          id="room_id"
          placeholder="Enter name"
        />
      </div>
      <div class="mt-2">
        <button
          onClick={onCreateRoom}
          class="px-6 py-2 text-sm text-blue-100 transition-colors duration-300 bg-blue-600 rounded-full shadow-xl hover:bg-blue-900 shadow-blue-400/30"
        >
          Create room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
