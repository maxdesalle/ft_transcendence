import { Component, createSignal, onMount } from 'solid-js';
import { unwrap } from 'solid-js/store';
import { useStore } from '../../store';
import { RoomInfoShort } from '../../types/chat.interface';

const AddUserToRoom: Component<{ currentRoom: RoomInfoShort }> = (props) => {
  const [username, setUsername] = createSignal('');
  const [state, { addUserToRoomByName }] = useStore();

  const onAddUser = () => {
    if (username() && addUserToRoomByName) {
      addUserToRoomByName({
        room_id: props.currentRoom.room_id,
        user_display_name: username(),
      });
      setUsername('');
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
        class="px-6 py-2 mt-3 text-sm text-blue-100 transition-colors duration-300 bg-blue-600 rounded-full shadow-xl hover:bg-blue-900 shadow-blue-400/30"
      >
        Add user
      </button>
    </div>
  );
};

export default AddUserToRoom;
