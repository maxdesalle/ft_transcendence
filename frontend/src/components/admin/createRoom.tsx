import { Component, createSignal } from 'solid-js';
import { mutate } from 'turbo-solid';
import { chatApi } from '../../api/chat';
import { routes } from '../../api/utils';
import { notifySuccess } from '../../utils/helpers';

const CreateRoom: Component<{ class?: string }> = (props) => {
  const [roomName, setRoomName] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isPrivate, setIsPrivate] = createSignal(false);

  const onCreateRoom = () => {
    if (!roomName().length) return;
    chatApi
      .createRoom({
        name: roomName(),
        private: isPrivate(),
        password: password(),
      })
      .then((res) => {
        mutate(routes.getRooms, (e) => [...e, res.data]);
        notifySuccess(`${roomName()} created`);
        setRoomName('');
      });
  };

  return (
    <div class={`flex flex-col ${props.class}`}>
      <div>
        <input
          value={roomName()}
          onInput={(e) => setRoomName(e.currentTarget.value)}
          autocomplete="off"
          type="text"
          class="bg-white px-2 w-full py-1 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_name"
          id="room_name"
          placeholder="Enter name"
        />
      </div>
      <div class="mt-2">
        <input
          onInput={(e) => setPassword(e.currentTarget.value)}
          autocomplete="off"
          type="text"
          class="bg-white px-2 py-1 w-full rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="room_password"
          id="room_password"
          placeholder="Enter password"
        />
      </div>
      <div class="mt-2 flex items-center">
        <label class="pr-2 pl-1">Private?</label>
        <input
          autocomplete="off"
          onInput={(e) => setIsPrivate(e.currentTarget.checked)}
          type="checkbox"
          class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
          name="is_private"
          id="is_private"
        />
      </div>
      <div class="mt-2">
        <button onClick={onCreateRoom} class="btn-primary">
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
