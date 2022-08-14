import { AxiosError } from 'axios';
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from 'solid-js';
import { chatApi } from '../api/chat';
import { routes } from '../api/utils';
import { useStore } from '../store';
import { RoomInfo } from '../types/chat.interface';
import { api } from '../utils/api';
import { notifyError, notifySuccess } from '../utils/helpers';

const RoomSettings: Component<{ refetch?: () => void }> = (props) => {
  const [state] = useStore();
  const [userId, setUserId] = createSignal(0);
  const roomId = () => state.chat.roomId;
  const [password, setPassword] = createSignal('');
  const [currentRoom, { refetch }] = createResource(
    roomId,
    async (id: number) => {
      const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
      return res.data;
    },
  );

  const onSetPrivate = () => {
    chatApi
      .setPrivate({
        room_id: currentRoom()!.room_id,
        private: true,
      })
      .then(() => {
        refetch();
        notifySuccess('Room set to private');
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  const onChangePassword = () => {
    chatApi
      .setRoomPassword({
        room_id: currentRoom()!.room_id,
        password: password(),
      })
      .then(() => {
        notifySuccess('Password updated');
        setPassword('');
        refetch();
      })
      .catch((err: AxiosError<{ message: string }>) => {
        setPassword('');
        notifyError(err.response?.data.message as string);
      });
  };

  const onSetOwner = (id: number) => {
    chatApi
      .setOwner({ room_id: currentRoom()!.room_id, user_id: id })
      .then(() => {
        if (props.refetch) props.refetch();
        refetch();
        setUserId(0);
        notifySuccess(`${id} is the new owner`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  createEffect(() => {
    console.log('selected user: ', userId());
  });

  return (
    <div class="p-2 flex flex-col text-white">
      <form
        class="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onChangePassword();
        }}
      >
        <label for="update_pw">Change password</label>
        <input
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          class="p-1 rounded-sm bg-skin-header-background"
          type="password"
          placeholder="Enter new password"
          name="update_pw"
          id="update_pw"
        />
        <button
          class="text-white w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
          type="submit"
        >
          Submit
        </button>
      </form>
      <form
        class="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSetOwner(userId());
        }}
      >
        <label for="update_pw">Change owner</label>
        <select
          onInput={(e) => setUserId(parseInt(e.currentTarget.value))}
          class="bg-skin-header-background"
        >
          <option class="" disabled selected value="">
            Select new owner
          </option>
          <For each={currentRoom()?.users}>
            {(user) => <option value={user.id}>{user.display_name}</option>}
          </For>
        </select>
        <button
          class="text-white w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
          type="submit"
        >
          Submit
        </button>
      </form>
      <Show when={currentRoom() && !currentRoom()!.private}>
        <button onClick={onSetPrivate} class="btn-primary w-full">
          Set private
        </button>
      </Show>
    </div>
  );
};

export default RoomSettings;
