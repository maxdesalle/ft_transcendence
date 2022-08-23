import { Component, createSignal } from 'solid-js';
import { mutate } from 'turbo-solid';
import { addUserToRoomByName } from '../../api/chat';
import { routes } from '../../api/utils';
import { useStore } from '../../store/all';
import { RoomInfo } from '../../types/chat.interface';
import { notifyError, notifySuccess } from '../../utils/helpers';

const AddUserToRoom: Component<{
  refetch?: () => void;
  currentRoom: RoomInfo;
}> = (props) => {
  const [state] = useStore();
  const [username, setUsername] = createSignal('');

  const onAddUser = () => {
    if (username() && props.currentRoom) {
      addUserToRoomByName({
        room_id: props.currentRoom!.room_id,
        user_display_name: username(),
      })
        .then((res) => {
          mutate(`${routes.chat}/room_info/${state.chat.roomId}`, {
            ...res.data,
          });
          notifySuccess(
            `${username()} has been added to ${props.currentRoom!.room_name}`,
          );
          setUsername('');
        })
        .catch(() => {
          notifyError(`${username()} not found`);
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
