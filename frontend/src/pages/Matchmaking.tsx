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
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { WsNotificationEvent } from '../types/chat.interface';
import { GameSession } from '../types/Game.interface';
import { User } from '../types/user.interface';
import { generateImageUrl, notifyError } from '../utils/helpers';
import LeaderBoard from './LeaderBoard';

const Matchmaking: Component = () => {
  const [state, { toggleMatchMaking }] = useStore();
  const [ref, setRef] = createSignal<any>();
  const [id, setId] = createSignal(0);
  const [, { setUser, setIsAuth }] = useAuth();
  const [buttonText, setButtonText] = createSignal('Play');
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const [gameSessions, { refetch }] = createTurboResource<GameSession[]>(
    () => `${urls.backendUrl}/pong/sessions`,
  );
  const [sockets] = useSockets();
  const [inQueue, setInQueue] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(!!Cookies.get('first_login'));

  const navigate = useNavigate();

  createEffect(() => {
    if (currentUser()) {
      setUser(currentUser()!);
      setIsAuth(true);
    }
  });

  onMount(() => {
    refetch();
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
      notifyError('User offline');
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

  const onCloseModal = () => {
    setIsOpen(false);
    Cookies.remove('first_login', { sameSite: 'none', secure: true });
  };

  const onNavigate = () => {
    onCloseModal();
    navigate('edit_profile');
  };

  return (
    <>
      <Modal
        bgColor="bg-black opacity-60"
        class="w-full h-full"
        isOpen={isOpen()}
      >
        <div class=" flex flex-col gap-2 p-3 rounded bg-base-300 top-1/4 left-1/3  w-1/4 absolute">
          <h1 class="text-3xl text-center font-bold">Welcome to 19 pong</h1>
          <div class="flex items-center gap-1">
            <p>
              You can edit your profile (change name, avatar and activate 2
              factor authentication)
            </p>
            <button onClick={onNavigate} class="btn btn-info btn-sm">
              Edit
            </button>
          </div>
          <p class="text-center text-lg font-semibold">Game controls</p>
          <div class="flex justify-center w-full">
            <kbd class="kbd">▲</kbd>
          </div>
          <div class="flex justify-center w-full">
            <kbd class="kbd">▼</kbd>
          </div>
          <div class="flex gap-1">
            <button
              onClick={onCloseModal}
              class="w-fit btn btn-sm btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <div class="lg:grid lg:grid-cols-4 flex flex-col items-center h-95">
        <div class="flex flex-col col-span-1 gap-2">
          <label for="friends" class="text-2xl mt-3">
            Invite a Friend
          </label>
          <select
            onInput={(e) => setId(parseInt(e.currentTarget.value))}
            class="select select-bordered focus:outline-none"
            name="friends"
            id="friends"
          >
            <option disabled selected>
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
          <button onClick={inviteFriend} class="btn-primary btn w-full">
            Invite
          </button>
        </div>
        <button
          ref={setRef}
          onClick={onButtonClick}
          class="btn mx-auto btn-accent w-72 h-72 col-span-2 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center"
        >
          <h1 class="text-4xl text-center w-full">{buttonText()}</h1>
        </button>
        <Show
          when={gameSessions() && gameSessions()!.length > 0}
          fallback={
            <LeaderBoard
              class="self-start col-span-1 h-full"
              title="Top 5"
              limit={5}
            />
          }
        >
          <div class="self-center col-span-1 h-full">
            <h1 class="text-xl ">Current matches</h1>
            <For each={gameSessions()}>
              {(session) => (
                <Link href={`/viewer/${session.session_id}`}>
                  <div class="flex gap-2 p-3 bg-base-300 justify-between items-center rounded-md">
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
          </div>
        </Show>
      </div>
    </>
  );
};

export default Matchmaking;
