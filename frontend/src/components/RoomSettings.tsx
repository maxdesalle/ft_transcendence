import { AxiosError } from 'axios';
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { chatApi } from '../api/chat';
import { routes } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { TAB, useStore } from '../store/all';
import { RoomInfo } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { notifyError, notifySuccess } from '../utils/helpers';

const RoomSettings: Component<{ owner: User }> = (props) => {
  const [state, { setCurrentRoomId, changeTab }] = useStore();
  const [userId, setUserId] = createSignal(0);
  const [password, setPassword] = createSignal('');
  const [{ user }] = useAuth();
  const path = state.chat.roomId
    ? `${routes.chat}/room_info/${state.chat.roomId}`
    : null;
  const [currentRoom, { mutate }] = createTurboResource<RoomInfo>(() => path);
  const bannedUserUrl = () =>
    state.chat.roomId ? `${routes.bannedUsers}/${state.chat.roomId}` : null;

  const [bannedUsers, { mutate: mutateBanned }] = createTurboResource<
    { id: number; login42: string; display_name: string; unban: Date }[]
  >(() => bannedUserUrl());

  const onSetPrivate = () => {
    chatApi
      .setPrivate({
        room_id: currentRoom()!.room_id,
        private: true,
      })
      .then((res) => {
        mutate({ ...res.data });
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
      .then((res) => {
        mutate({ ...res.data });
        notifySuccess('Password updated');
        setPassword('');
      })
      .catch((err: AxiosError<{ message: string }>) => {
        setPassword('');
        notifyError(err.response?.data.message as string);
      });
  };

  const onSetOwner = (id: number) => {
    chatApi
      .setOwner({ room_id: currentRoom()!.room_id, user_id: id })
      .then((res) => {
        mutate({ ...res.data });
        setUserId(0);
        const user = currentRoom()?.users.find((user) => user.id === userId());
        notifySuccess(`${user?.display_name} is the new owner`);
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
        //TODO: reset the room messages (it stays in cache)
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
        mutateBanned((s) => [...s!.filter((u) => u.id !== user.id)]);
        notifySuccess(`${user.display_name} got unbaned 😙`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  return (
    <div class="p-2 flex flex-col ">
      <form
        class="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onChangePassword();
        }}
      >
        <label class="text-lg font-semibold" for="update_pw">
          Change password
        </label>
        <input
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          class="input input-sm"
          type="password"
          placeholder="Enter new password"
          name="update_pw"
          id="update_pw"
        />
        <button class="btn btn-primary btn-sm" type="submit">
          Submit
        </button>
      </form>
      <form
        class="flex flex-col gap-3 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSetOwner(userId());
        }}
      >
        <label for="update_pw" class="text-lg font-semibold">
          Change owner
        </label>
        <select
          onInput={(e) => setUserId(parseInt(e.currentTarget.value))}
          class="select select-bordered"
        >
          <option class="" disabled selected value="">
            Select new owner
          </option>
          <For
            each={currentRoom()?.users.filter(
              (user) => user.id !== props.owner.id,
            )}
          >
            {(user) => <option value={user.id}>{user.display_name}</option>}
          </For>
        </select>
        <button class="btn btn-primary btn-sm" type="submit">
          Submit
        </button>
      </form>
      <div class="flex flex-col gap-2">
        <Show when={currentRoom() && !currentRoom()!.private}>
          <button onClick={onSetPrivate} class="btn-primary btn btn-sm w-full">
            Set private
          </button>
        </Show>
        <button onClick={onLeaveGroup} class="btn-secondary btn btn-sm w-full">
          Leave
        </button>
      </div>
      <div>
        <p class="text-lg font-semibold py-2">Benned users</p>
        <For each={bannedUsers()}>
          {(user) => (
            <div class="flex justify-between p-1 items-center">
              <h1 class="capitalize">{user.display_name}</h1>
              <button
                onClick={() => onUnban(user)}
                class="btn-success btn btn-sm"
              >
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
