import { Link, useNavigate } from 'solid-app-router';
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
import Avatar from '../components/Avatar';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { WsNotificationEvent } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { generateImageUrl, notifyError } from '../utils/helpers';

interface GameSession {
  session_id: number;
  avatarId: number;
  p1: Partial<User>;
  p2: Partial<User>;
}

const Matchmaking: Component = () => {
  const [state, { toggleMatchMaking }] = useStore();
  const [ref, setRef] = createSignal<any>();
  const [id, setId] = createSignal(0);
  const [auth, { setUser, setIsAuth }] = useAuth();
  const [buttonText, setButtonText] = createSignal('Play');
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const [gameSessions] = createTurboResource<GameSession[]>(
    () => `${urls.backendUrl}/pong/sessions`,
  );
  const [sockets] = useSockets();
  const [inQueue, setInQueue] = createSignal(false);

  const navigate = useNavigate();

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
    setButtonText('Cancel...');
    setInQueue(true);
  };

  const onCancelQueue = () => {
    sockets.pongWs!.send(JSON.stringify({ event: 'cancel' }));
    setButtonText('Play');
    ref().classList.toggle('animate-pulse');
    setInQueue(false);
    toggleMatchMaking(false);
  };

  const onButtonClick = () => {
    if (inQueue()) {
      onCancelQueue();
      return;
    }
    onPlay();
  };

  const inviteFriend = () => {
    if (!id()) return;
    if (!state.onlineUsers.includes(id())) {
      notifyError('user not online');
    }
    const data = { event: 'invite', data: id() };
    sockets.pongWs!.send(JSON.stringify(data));
  };

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs!.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent };
        res = JSON.parse(e.data);
        if (res.event === 'pong: player_joined') {
          navigate('/pong');
        }
      });
    }
  });

  onCleanup(() => {
    if (inQueue()) {
      sockets.pongWs!.send(JSON.stringify({ event: 'cancel' }));
    }
  });

  return (
    <div class="h-95 flex text-white justify-between">
      <button
        ref={setRef}
        onClick={onButtonClick}
        class="h-72 w-72 rounded-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        <h1 class="text-4xl text-center w-full">{buttonText()}</h1>
      </button>
      <div class="flex flex-col gap-2 h-full mt-10">
        <Show when={gameSessions()}>
          <For each={gameSessions()}>
            {(session) => (
              <Link href={`/viewer/${session.session_id}`}>
                <div class="flex gap-2 p-3 bg-amber-800 items-center rounded-md">
                  <div class="flex flex-col items-center">
                    <Avatar
                      imgUrl={
                        session.p1.avatarId
                          ? generateImageUrl(session.p1.avatarId)
                          : undefined
                      }
                    />
                    <p>{session.p1.display_name}</p>
                  </div>
                  <p class="text-xl">vs</p>
                  <div class="flex flex-col items-center">
                    <Avatar
                      imgUrl={
                        session.p2.avatarId
                          ? generateImageUrl(session.p2.avatarId)
                          : undefined
                      }
                    />
                    <p>{session.p2.display_name}</p>
                  </div>
                </div>
              </Link>
            )}
          </For>
        </Show>
      </div>
      <div class="flex flex-col gap-2">
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
        <button onClick={inviteFriend} class="btn-primary w-full">
          Invite
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
