import { Link, useParams } from 'solid-app-router';
import { Component, createResource, For, Show } from 'solid-js';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO, PlayerStatsDto } from '../types/stats.interface';
import MatchHistoryCard from '../components/MatchHistoryCard';
import { sendFriendReq } from '../api/user';
import { AxiosError } from 'axios';
import Scrollbars from 'solid-custom-scrollbars';
import { useSockets } from '../Providers/SocketProvider';
import { useAuth } from '../Providers/AuthProvider';

const Profile: Component = () => {
  const [sockets] = useSockets();
  const [auth] = useAuth();
  const params = useParams<{ id: string }>();
  const [matches] = createTurboResource<MatchDTO[]>(
    () => `${routes.matches}/${parseInt(params.id)}`,
  );
  const userByIdUrl = () => (params.id ? `${routes.users}/${params.id}` : null);
  const userStatsUrl = () =>
    params.id ? `${routes.playerStats}/${params.id}` : null;
  const [user] = createTurboResource(() => userByIdUrl());
  const [stats] = createTurboResource<PlayerStatsDto>(() => userStatsUrl());

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
    sockets.pongWs!.send(JSON.stringify(data));
  };

  return (
    <Show when={user()}>
      <div class="flex justify-evenly">
        <div class="mt-7 border-r border-gray-600 shadow-md flex flex-col gap-2 items-center">
          <div class="text-white flex flex-col items-center">
            <img
              class="w-40 h-44 mt-5"
              src={
                user()!.avatarId
                  ? generateImageUrl(user()!.avatarId)
                  : defaultAvatar
              }
            />
            <h1 class="text-xl text-start w-full">{user()!.display_name}</h1>
            <p class="text-center w-full">Rank: {stats()?.ladder_rank}</p>
            <div class="flex w-full gap-2 justify-between pr-4">
              <p>win: {stats()?.wins}</p>
              <p>loss: {stats()?.losses}</p>
            </div>
          </div>
          <ul class="flex flex-col gap-2 text-white">
            <Show when={auth.user && parseInt(params.id) !== auth.user.id}>
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
              <li>
                <button class="btn-secondary w-full">Block</button>
              </li>
            </Show>
            <Show when={auth.user && auth.user.id === parseInt(params.id)}>
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
            <Show when={matches()}>
              <For each={matches()}>
                {(match) => <MatchHistoryCard match={match} />}
              </For>
            </Show>
          </Scrollbars>
        </div>
      </div>
    </Show>
  );
};

export default Profile;
