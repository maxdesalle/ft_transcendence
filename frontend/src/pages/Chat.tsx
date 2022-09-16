import {
  Component,
  createEffect,
  createResource,
  createSignal,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
} from 'solid-js';
import ChatSideBar from '../components/ChatSideBar';
import ChatMessagesBox from '../components/ChatMessagesBox';
import ChatRightSideBar from '../components/ChatRightSideBar';
import 'simplebar';
import { chatApi } from '../api/chat';
import { TAB, useStore } from '../store/StoreProvider';
import { routes } from '../api/utils';
import {
  Message,
  RoomInfo,
  WsNotificationEvent,
} from '../types/chat.interface';
import { notifyError } from '../utils/helpers';
import { AxiosError } from 'axios';
import ChatHome from '../components/ChatHome';
import { useSockets } from '../Providers/SocketProvider';
import FriendSideBar from '../components/FriendSideBar';
import { fetchUserById } from '../api/user';
import { createTurboResource } from 'turbo-solid';
import { useAuth } from '../Providers/AuthProvider';

const Chat: Component = () => {
  const [state, { changeTab, setCurrentRoomId }] = useStore();
  const friendId = () => state.chat.friendId;
  const roomPath = () =>
    state.chat.roomId ? `${routes.chat}/room_info/${state.chat.roomId}` : null;
  const [currentRoom] = createTurboResource<RoomInfo>(() => roomPath());

  const [sockets] = useSockets();

  const [friend, { mutate }] = createResource(
    () => state.chat.friendId,
    fetchUserById,
  );

  const roomId = () => state.chat.roomId;

  const url = () =>
    state.chat.roomId ? `${routes.roomMessages}/${roomId()}` : undefined;

  const [
    roomMessages,
    { mutate: mutateRoomMessages, refetch: refetchRoomMsgs },
  ] = createTurboResource<Message[]>(() => url());

  const [auth] = useAuth();
  const friendMsgPath = () =>
    friendId() ? `${routes.chat}/dm/${friendId()}` : undefined;
  const [friendMessages, { mutate: mutateFriendMessages, refetch }] =
    createTurboResource<Message[]>(() => friendMsgPath());

  const onSendMessageToRoom = (message: string) => {
    if (!currentRoom()) return;
    chatApi
      .postMessageToRoom({
        room_id: currentRoom()!.room_id,
        message: message,
      })
      .catch(() => {
        notifyError('You have been muted 😞');
      });
  };

  createEffect(
    on(roomId, () => {
      refetchRoomMsgs();
    }),
  );

  const onSendMessageToFriend = (message: string) => {
    if (state.chat.friendId && friend()) {
      chatApi
        .sendDm({ user_id: friend()!.id, message: message })
        .then(() => {
          if (ref()) ref()!.focus();
        })
        .catch((err: AxiosError<{ message: string }>) => {
          notifyError(err.response?.data.message as string);
        });
    }
  };
  createEffect(
    on(friendId, () => {
      refetch();
    }),
  );

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; message: Message };
        res = JSON.parse(e.data);
        if (res.event === 'chat_room_msg') {
          if (state.chat.roomId) {
            if (res.message.room_id === state.chat.roomId) {
              mutateRoomMessages((e) => [
                ...e!.filter((m) => m.id != res.message.id),
                res.message,
              ]);
            }
          }
        } else if (res.event === 'chat_dm') {
          if (state.chat.friendId) {
            if (
              res.message.user_id === state.chat.friendId ||
              res.message.user_id === auth.user.id
            )
              mutateFriendMessages((e) => [
                ...e!.filter((m) => m.id != res.message.id),
                res.message,
              ]);
          }
        } else if (res.event === 'chat: youGotBanned') {
          mutateRoomMessages(() => []);
        }
      });
    }
  });

  onCleanup(() => {
    changeTab(TAB.HOME);
    setCurrentRoomId(undefined);
    mutateRoomMessages(() => []);
  });

  createEffect(
    on(
      [
        () => state.chatUi.tab,
        () => state.chat.roomId,
        () => state.chat.friendId,
      ],
      () => {
        if (
          sockets.notificationWs &&
          sockets.notificationWs.readyState === WebSocket.OPEN
        ) {
          sockets.notificationWs.send(
            JSON.stringify({
              event: 'isOnline',
              data: { sender: auth.user.id },
            }),
          );

          sockets.notificationWs.send(
            JSON.stringify({
              event: 'isInGame',
              data: { sender: auth.user.id },
            }),
          );
        }
      },
    ),
  );

  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  createEffect(
    on(roomId, () => {
      setRef(document.getElementById('message_input'));
    }),
  );

  createEffect(
    on(friendId, () => {
      setRef(document.getElementById('message_input'));
    }),
  );

  createEffect(
    on(ref, () => {
      if (ref()) {
        ref()!.focus();
      }
    }),
  );

  return (
    <div class="lg:grid lg:grid-cols-6 flex h-95">
      <div class="flex row-span-4 flex-col col-span-1 border-x border-x-base-300 shadow-sm">
        <ChatSideBar />
      </div>
      <div class="col-span-4 w-full flex flex-col h-95 pl-1 pr-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <Show when={roomMessages()}>
              <ChatMessagesBox
                messages={roomMessages()!}
                onSendMessage={onSendMessageToRoom}
              />
            </Show>
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <Show when={friendMessages()}>
              <ChatMessagesBox
                messages={friendMessages()!}
                onSendMessage={onSendMessageToFriend}
              />
            </Show>
          </Match>
          <Match when={state.chatUi.tab === TAB.HOME}>
            <ChatHome />
          </Match>
        </Switch>
      </div>
      <div class="flex relative row-span-4 flex-col border-x border-x-base-300 shadow-sm col-span-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatRightSideBar />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <Show when={friend()}>
              <FriendSideBar mutate={mutate} friend={friend()!} />
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default Chat;
