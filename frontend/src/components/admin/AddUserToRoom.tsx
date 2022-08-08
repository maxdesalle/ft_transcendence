import { Component, createSignal, onMount } from 'solid-js';
import toast from 'solid-toast';
import { createTurboResource } from 'turbo-solid';
import { addUserToRoomByName } from '../../api/chat';
import { routes } from '../../api/utils';
import { useStore } from '../../store';
import { RoomInfo } from '../../types/chat.interface';

const AddUserToRoom: Component<{}> = () => {
  const [username, setUsername] = createSignal('');
  const notify = (msg: string) => toast(msg);
  const [state] = useStore();
  const [currentRoom, { refetch: refetchCurrentRoom }] =
    createTurboResource<RoomInfo>(() => `${routes.chat}/room_info/${roomId()}`);

  const roomId = () => state.chat.roomId;

  const onAddUser = () => {
    if (username() && currentRoom()) {
      addUserToRoomByName({
        room_id: currentRoom()!.room_id,
        user_display_name: username(),
      })
        .then(() => {
          refetchCurrentRoom();
          notify(`${username()} has been added to ${currentRoom()!.room_name}`);
          setUsername('');
        })
        .catch(() => {
          notify(`${username()} not found`);
        });
    }
  };

  return (
    <div class="flex flex-col">
      <input
        onInput={(e) => setUsername(e.currentTarget.value)}
        type="text"
        autocomplete="off"
        name="username"
        id="username"
        value={username()}
        class="focus:outline-none border-b-2 text-gray-900 border-blue-500 rounded-md p-1"
        placeholder="Enter username"
      />
      <button
        onClick={onAddUser}
        class="px-6 py-2 mt-3 text-sm text-blue-100 transition-colors duration-300 bg-blue-600 rounded-full hover:bg-blue-900 shadow-blue-400/30"
      >
        Add user
      </button>
    </div>
  );
};

export default AddUserToRoom;
