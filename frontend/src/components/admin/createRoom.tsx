import { Component, createSignal } from 'solid-js';
import { chatApi } from '../../api/chat';

const CreateRoom: Component<{ refetch: () => void }> = (props) => {
  const [roomName, setRoomName] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isPrivate, setIsPrivate] = createSignal(false);

  const onCreateRoom = () => {
    if (!roomName().length) return;
    chatApi.createRoom({ name: roomName() }).then((res) => {
      props.refetch();
    });
    setRoomName('');
  };

  return (
    <div class="flex flex-col">
      <div>
        <input
          onInput={(e) => setRoomName(e.currentTarget.value)}
          autocomplete="off"
          type="text"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_name"
          id="room_name"
          placeholder="Enter name"
        />
      </div>
      <div class="mt-2">
        <input
          autocomplete="off"
          type="text"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_password"
          id="room_password"
          placeholder="Enter password"
        />
      </div>
      <div class="mt-2 flex items-center">
        <label class="pr-2 pl-1">Private?</label>
        <input
          autocomplete="off"
          type="radio"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="is_private"
          id="is_private"
        />
      </div>
      <div class="mt-2">
        <button
          onClick={onCreateRoom}
          class="px-6 py-2 text-sm text-blue-100 transition-colors duration-300 bg-blue-600 rounded-full shadow-xl hover:bg-blue-900 shadow-blue-400/30"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
