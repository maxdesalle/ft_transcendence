import { Component, createSignal } from 'solid-js';
import { mutate } from 'turbo-solid';
import { addUserToRoomByName } from '../../api/chat';
import { routes } from '../../api/utils';
import { useStore } from '../../store/StoreProvider';
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
    <div class="flex flex-col gap-2">
      <input
        onInput={(e) => setUsername(e.currentTarget.value)}
        type="text"
        autocomplete="off"
        name="username"
        id="username"
        value={username()}
        class="input input-sm"
        placeholder="Enter username"
      />
      <button onClick={onAddUser} class="btn btn-success btn-sm">
        Add user
      </button>
    </div>
  );
};

export default AddUserToRoom;
