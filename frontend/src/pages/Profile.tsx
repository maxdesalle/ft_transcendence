import { Link, useParams } from 'solid-app-router';
import { Component, createEffect, createResource, For, Show } from 'solid-js';
import { User } from '../types/user.interface';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO } from '../types/stats.interface';
import MatchHistoryCard from '../components/MatchHistoryCard';
import { fetchUserById, sendFriendReq } from '../api/user';
import { AxiosError } from 'axios';
import { useStore } from '../store/all';
import Scrollbars from 'solid-custom-scrollbars';
import { useSockets } from '../Providers/SocketProvider';

const Profile: Component = () => {
  const [state] = useStore();
  const [{ pongWs }] = useSockets();
  const params = useParams<{ id: string }>();
  const [matches] = createTurboResource<MatchDTO[]>(
    () => `${routes.matches}/${parseInt(params.id)}`,
  );
  const id = () => Number(params.id);
  const [user] = createResource(id, fetchUserById);
  const [currentUser] = createTurboResource(() => routes.currentUser);

  const onSendFriendReq = () => {
    if (user()) {
      sendFriendReq(user()!.id)
        .then(() => {
          notifySuccess(`Request sent to ${user()!.display_name}`);
        })
        .catch((err: AxiosError<{ message: string }>) => {
          notifyError(err.response?.data.message as string);
        });
    }
  };

  const onInviteUser = () => {
    if (!user()) return;
    const data = { event: 'invite', data: user()!.id };
    pongWs!.send(JSON.stringify(data));
  };

  return (
    <Show when={user()}>
      <div class="flex justify-evenly">
        <div class="mt-7 border-r border-gray-600 shadow-md flex flex-col items-center">
          <div class="text-white flex flex-col items-center">
            <img
              class="w-40 h-44 mt-5"
              src={
                user()!.avatarId
                  ? generateImageUrl(user()!.avatarId)
                  : defaultAvatar
              }
            />
            <h1 class="text-xl">{user()!.display_name}</h1>
          </div>
          <ul class="flex flex-col text-white">
            <Show
              when={currentUser() && parseInt(params.id) !== currentUser().id}
            >
              <li>
                <button onClick={onSendFriendReq} class="btn-primary w-full">
                  Send friend request
                </button>
              </li>
              <li>
                <button onClick={onInviteUser} class="btn-primary w-full">
                  Invite to play
                </button>
              </li>
            </Show>
            <Show
              when={currentUser() && currentUser().id === parseInt(params.id)}
            >
              <li>
                <Link class="btn-primary" href="/edit_profile">
                  Edit profile
                </Link>
              </li>
              <li>
                <button class="btn-secondary">Sign out</button>
              </li>
            </Show>
          </ul>
        </div>
        <div class="flex flex-col w-4/5">
          <h1 class="text-center font-bold text-2xl py-2 text-blue-600">
            Match History
          </h1>
          <Show when={matches()}>
            <Scrollbars
              style={{
                height: '89vh',
                display: 'flex',
                'flex-direction': 'column',
                'justify-content': 'flex-end',
                gap: '0.5rem',
                width: '100%',
              }}
            >
              <For each={matches()}>
                {(match) => <MatchHistoryCard match={match} />}
              </For>
            </Scrollbars>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default Profile;
