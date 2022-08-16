import Cookies from 'js-cookie';
import { Link, useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes, urls } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store';
import { User } from '../types/user.interface';

const Matchmaking: Component = () => {
  const [state, { toggleMatchMaking, setFriendInvitation, setToken }] =
    useStore();
  const [ref, setRef] = createSignal<any>();
  const [id, setId] = createSignal(0);
  const [auth, { setUser, setIsAuth, setToken: setAuthToken }] = useAuth();
  const [buttonText, setButtonText] = createSignal('Play');
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const [gameSessions] = createTurboResource<number[]>(
    () => `${urls.backendUrl}/pong/sessions`,
  );
  const [sockets] = useSockets();

  const navigate = useNavigate();

  onMount(() => {
    const token = Cookies.get('jwt_token');
    setToken(token);
    setAuthToken(token);
  });

  createEffect(() => {
    if (currentUser()) {
      setUser(currentUser()!);
      setIsAuth(true);
    }
  });

  const onPlay = () => {
    const message = { event: 'play' };
    sockets.pongWs!.send(JSON.stringify(message));
    toggleMatchMaking(true);
    ref().classList.toggle('animate-pulse');
    setButtonText('Searching...');
  };

  const inviteFriend = () => {
    if (!id()) return;
    const data = { event: 'invite', data: id() };
    // state.pong.ws.send(JSON.stringify(data));
  };

  const onAcceptInvite = () => {
    const data = {
      event: 'accept',
      data: state.pong.friendInvitation?.user_id,
    };
    // state.pong.ws.send(JSON.stringify(data));
    navigate('/pong');
    setFriendInvitation(null);
  };
  return (
    <div class="h-full flex items-center text-white justify-between">
      <button
        ref={setRef}
        onClick={onPlay}
        class="h-72 w-72 rounded-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        <h1 class="text-4xl text-center w-full">{buttonText()}</h1>
      </button>
      <div>
        <Show when={gameSessions()}>
          <For each={gameSessions()}>
            {(id) => (
              <Link href={`/viewer/${id}`}>
                <p>{id}</p>
              </Link>
            )}
          </For>
        </Show>
      </div>
      <div class="flex flex-col">
        <label for="friends" class="text-2xl mt-3">
          Invite a friend
        </label>
        <select
          onInput={(e) => setId(parseInt(e.currentTarget.value))}
          class="bg-skin-menu-background p-1"
          name="friends"
          id="friends"
        >
          <option disabled selected value="">
            Select a friend
          </option>
          <Show when={friends()}>
            <For each={friends()}>
              {(friend) => (
                <option value={friend.id}>{friend.display_name}</option>
              )}
            </For>
          </Show>
        </select>
        <button onClick={inviteFriend} class="btn-primary">
          Invite
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
