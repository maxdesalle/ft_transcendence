import Cookies from 'js-cookie';
import { useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes, urls } from '../api/utils';
import { useStore } from '../store';
import { User } from '../types/user.interface';

const Home: Component = () => {
  const [state, { toggleMatchMaking, setFriendInvitation, setToken }] =
    useStore();
  const [ref, setRef] = createSignal<any>();
  const [id, setId] = createSignal(0);
  const [matchFound, setMatchFound] = createSignal<{
    event: string;
    user_id: number;
  }>();
  const [buttonText, setButtonText] = createSignal('Play');
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const [gameSessions] = createTurboResource<number[]>(
    () => `${urls.backendUrl}/pong/sessions`,
  );

  const navigate = useNavigate();

  onMount(() => {
    const token = Cookies.get('jwt_token');
    setToken(token);
  });

  createEffect(() => {
    console.log('game sessions: ', gameSessions());
  });

  onCleanup(() => {
    state.pong.ws.removeEventListener('message', (e) => {
      console.log('removing event: ', e);
    });
  });

  const onPlay = () => {
    const message = { event: 'play' };
    state.pong.ws.send(JSON.stringify(message));
    toggleMatchMaking(true);
    ref().classList.toggle('animate-pulse');
    setButtonText('Searching...');
  };

  const inviteFriend = () => {
    if (!id()) return;
    const data = { event: 'invite', data: id() };
    state.pong.ws.send(JSON.stringify(data));
  };

  const onAcceptInvite = () => {
    const data = {
      event: 'accept',
      data: state.pong.friendInvitation?.user_id,
    };
    state.pong.ws.send(JSON.stringify(data));
    navigate('/pong');
    setFriendInvitation(null);
  };

  return (
    <div class="h-full flex items-center text-white justify-between">
      <button
        // style="border-top-color:transparent"
        ref={setRef}
        onClick={onPlay}
        class="h-72 w-72 rounded-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        <h1 class="text-4xl text-center w-full">{buttonText()}</h1>
      </button>
      <div>
        <Show when={state.pong.friendInvitation && friends()}>
          <div class="animate-bounce">
            <h1 class="text-2xl">
              New invitation from{' '}
              {
                friends()!.find(
                  (user) => user.id === state.pong.friendInvitation?.user_id,
                )?.display_name
              }
            </h1>
            <button class="btn-primary text-2xl" onClick={onAcceptInvite}>
              Accept
            </button>
            <button class="btn-secondary text-2xl">Reject</button>
          </div>
        </Show>
      </div>
      <div class="flex flex-col">
        <label for="friends" class="text-2xl">
          Invite a friend
        </label>
        <select
          onInput={(e) => setId(parseInt(e.currentTarget.value))}
          class="bg-skin-menu-background p-1"
          name="friends"
          id="friends"
        >
          <option disabled selected value="">
            select a friend
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

export default Home;
