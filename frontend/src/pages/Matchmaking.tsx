import { Link, useNavigate } from 'solid-app-router';
import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes, urls } from '../api/utils';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { WsNotificationEvent } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { generateImageUrl, notifyError } from '../utils/helpers';
import LeaderBoard from './LeaderBoard';

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
  const [isOpen, setIsOpen] = createSignal(true);

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

  return (
    <>
      <Modal
        bgColor="bg-black opacity-60"
        class="w-full h-full"
        isOpen={auth.user.first_login === true}
      >
        <div class=" flex flex-col gap-2 p-3 bg-skin-header-background top-1/4 left-1/3  w-1/4 absolute">
          <h1>Welcome to 19 pong</h1>
          <p>
            You cant edit your profile here{' '}
            <Link class="btn-primary" href="/edit_profile">
              Edit
            </Link>
          </p>
          <button onClick={() => setIsOpen(false)} class="w-fit btn-secondary">
            Close
          </button>
        </div>
      </Modal>
      <div class="h-95 flex  justify-between">
        <button
          ref={setRef}
          onClick={onButtonClick}
          class="btn btn-accent w-72 h-72 rounded-full self-center bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center"
        >
          <h1 class="text-4xl text-center w-full">{buttonText()}</h1>
        </button>
        <div class="flex flex-col gap-2 h-full mt-10 w-2/3">
          <Show
            when={gameSessions() && gameSessions()!.length > 0}
            fallback={<LeaderBoard />}
          >
            <h1 class="text-xl ">Current matches</h1>
            <For each={gameSessions()}>
              {(session) => (
                <Link href={`/viewer/${session.session_id}`}>
                  <div class="flex gap-2 p-3 bg-violet-800 justify-between items-center rounded-md">
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
        <div class="flex flex-col gap-2 self-center">
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
      </div>
    </>
  );
};

export default Matchmaking;
