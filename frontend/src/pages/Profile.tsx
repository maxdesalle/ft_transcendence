import { Link, useParams } from 'solid-app-router';
import { Component, createEffect, For, Show } from 'solid-js';
import { User } from '../types/user.interface';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO } from '../types/stats.interface';
import MatchHistoryCard from '../components/MatchHistoryCard';
import { sendFriendReq } from '../api/user';
import { AxiosError } from 'axios';
import { useStore } from '../store';
import Scrollbars from 'solid-custom-scrollbars';

const Profile: Component = () => {
  const [state] = useStore();
  const params = useParams<{ id: string }>();
  const [matches] = createTurboResource<MatchDTO[]>(
    () => `${routes.matches}/${parseInt(params.id)}`,
  );
  const [user] = createTurboResource<User>(
    () => `${routes.users}/${params.id}`,
  );
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
    state.pong.ws.send(JSON.stringify(data));
  };

  createEffect(() => {
    console.log('matches: ', matches());
    console.log('user: ', user());
  });

  return (
    <Show when={user()}>
      <div class="flex justify-evenly">
        <div class="mt-7">
          <div class="text-white">
            <img
              class="w-40 h-44 mt-5 rounded-md"
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
                <button
                  onClick={onSendFriendReq}
                  class="text-white bg-gradient-to-r w-full from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded text-sm px-2 py-1.5 text-center"
                >
                  Send friend request
                </button>
              </li>
              <li>
                <button
                  onClick={onInviteUser}
                  class="text-white w-full mt-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded text-sm px-2 py-1.5 text-center"
                >
                  Invite to play
                </button>
              </li>
            </Show>
            <Show
              when={currentUser() && currentUser().id === parseInt(params.id)}
            >
              <li>
                <Link
                  class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                  href="/edit_profile"
                >
                  Edit profile
                </Link>
              </li>
              <li>
                <button class="text-white bg-gradient-to-r mt-2 from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2">
                  Sign out
                </button>
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
              width: '100%',
            }}
          >
            {/* <div class="scrollbar flex border-l flex-col items-center w-full  scrollbar-thumb-gray-700 scrollbar-track-gray-500 h-82"> */}
            <Show when={matches()}>
              <For each={matches()}>
                {(match) => (
                  <div class="px-2">
                    <MatchHistoryCard match={match} />
                  </div>
                )}
              </For>
            </Show>
            {/* </div> */}
          </Scrollbars>
        </div>
      </div>
    </Show>
  );
};

export default Profile;
