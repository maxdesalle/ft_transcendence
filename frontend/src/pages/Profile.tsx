import { Link, useNavigate, useParams } from 'solid-app-router';
import { Component, createResource, For, onMount, Show } from 'solid-js';
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
import Loader from '../components/Loader';
import { useStore } from '../store/all';
import { User } from '../types/user.interface';

const Profile: Component = () => {
  const [sockets] = useSockets();
  const [auth] = useAuth();
  const params = useParams<{ id: string }>();
  const [matches, { refetch }] = createTurboResource<MatchDTO[]>(
    () => `${routes.matches}/${parseInt(params.id)}`,
  );
  const userByIdUrl = () => (params.id ? `${routes.users}/${params.id}` : null);
  const userStatsUrl = () =>
    params.id ? `${routes.playerStats}/${params.id}` : null;
  const [user] = createTurboResource<User>(() => userByIdUrl());
  const [stats, { refetch: refetchStats }] =
    createTurboResource<PlayerStatsDto>(() => userStatsUrl());
  const navigate = useNavigate();
  const [state] = useStore();

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

  onMount(() => {
    refetch();
    refetchStats();
  });

  const onInviteUser = () => {
    if (!user()) return;
    if (!state.onlineUsers.includes(user()!.id)) {
      notifyError(`${user()!.display_name} is not online`);
      return;
    }
    const data = { event: 'invite', data: user()!.id };
    sockets.pongWs!.send(JSON.stringify(data));
  };

  return (
    <Show when={user()}>
      <div class="flex justify-evenly">
        <div class="mt-7 pr-2 border-r border-gray-600 shadow-md flex flex-col gap-2 items-center">
          <div class=" gap-1 flex flex-col items-center">
            <img
              class="w-40 h-44 mt-5 mask mask-decagon"
              src={
                user()!.avatarId
                  ? generateImageUrl(user()!.avatarId)
                  : defaultAvatar
              }
            />
            <h1 class="text-xl capitalize font-semibold py-1 text-start w-full">
              {user()!.display_name}
            </h1>
            <p class="w-full">Rank: {stats()?.ladder_rank}</p>
            <div class="flex w-full py-1 justify-between pr-4">
              <p class="text-success">Wins: {stats()?.wins}</p>
              <p class="text-error">losses: {stats()?.losses}</p>
            </div>
            <p class="w-full">
              Winrate: {stats()?.wins_percent ? stats()?.wins_percent : 0}%
            </p>
          </div>
          <ul class="flex flex-col gap-2">
            <Show when={auth.user && parseInt(params.id) !== auth.user.id}>
              <li>
                <button
                  onClick={onSendFriendReq}
                  class="btn-primary btn btn-sm w-full"
                >
                  Send friend request
                </button>
              </li>
              <li>
                <button
                  onClick={onInviteUser}
                  class="btn-primary btn btn-sm w-full"
                >
                  Invite to play
                </button>
              </li>
              <li>
                <button class="btn-error w-full btn btn-sm">Block</button>
              </li>
            </Show>
            <Show when={auth.user && auth.user.id === +params.id}>
              <li>
                <button
                  onClick={() => navigate('/edit_profile')}
                  class="btn-primary w-full btn btn-sm"
                >
                  Edit profile
                </button>
              </li>
              <li>
                <button class="btn-secondary btn btn-sm w-full">
                  Sign out
                </button>
              </li>
            </Show>
          </ul>
        </div>
        <div class="flex flex-col w-4/5">
          <h1 class="text-center font-bold text-2xl py-2">Match History</h1>
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
            <Show when={matches()} fallback={<Loader />}>
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
