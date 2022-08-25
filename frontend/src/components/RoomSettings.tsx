import { AxiosError } from 'axios';
import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { chatApi } from '../api/chat';
import { routes } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { TAB, useStore } from '../store/all';
import { RoomInfo } from '../types/chat.interface';
import { notifyError, notifySuccess } from '../utils/helpers';

const RoomSettings: Component<{ refetch?: () => void }> = (props) => {
  const [state, { setCurrentRoomId, changeTab }] = useStore();
  const [userId, setUserId] = createSignal(0);
  const [password, setPassword] = createSignal('');
  const [{ user }] = useAuth();
  const path = state.chat.roomId
    ? `${routes.chat}/room_info/${state.chat.roomId}`
    : null;
  const [currentRoom, { refetch, mutate }] = createTurboResource<RoomInfo>(
    () => path,
  );
  const bannedUserUrl = () =>
    state.chat.roomId ? `${routes.bannedUsers}/${state.chat.roomId}` : null;

  const [bannedUsers, { refetch: refetchUnbaned }] = createTurboResource<
    { id: number; login42: string; display_name: string; unban: Date }[]
  >(() => bannedUserUrl());

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

  const onLeaveGroup = () => {
    chatApi
      .leaveGroup(currentRoom()!.room_id)
      .then(() => {
        notifySuccess(`${user.display_name} left ${currentRoom()!.room_name}`);
        setCurrentRoomId(undefined);
        changeTab(TAB.HOME);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  const onUnban = (user: { id: number; display_name: string }) => {
    chatApi
      .unbanUser({ user_id: user.id, room_id: currentRoom()!.room_id })
      .then((res) => {
        mutate({ ...res.data });
        notifySuccess(`${user.display_name} got unbaned 😙`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

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
          class="p-1 rounded-sm outline-none bg-skin-header-background"
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
      <button onClick={onLeaveGroup} class="btn-secondary w-full">
        Leave
      </button>
      <div>
        <p>Benned users</p>
        <For each={bannedUsers()}>
          {(user) => (
            <div class="flex justify-between border px-1 pt-1 border-header-menu">
              <h1 class="capitalize">{user.display_name}</h1>
              <button onClick={() => onUnban(user)} class="btn-primary">
                unban
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default RoomSettings;
