import {
  Component,
  createEffect,
  createResource,
  Match,
  Show,
  Switch,
} from 'solid-js';
import ChatSideBar from '../components/ChatSideBar';
import ChatMessagesBox from '../components/ChatMessagesBox';
import ChatRightSideBar from '../components/ChatRightSideBar';
import 'simplebar';
import { chatApi } from '../api/chat';
import { TAB, useStore } from '../store/all';
import { routes } from '../api/utils';
import {
  Message,
  RoomInfo,
  WsNotificationEvent,
} from '../types/chat.interface';
import { api } from '../utils/api';
import { notifyError } from '../utils/helpers';
import { AxiosError } from 'axios';
import ChatHome from '../components/ChatHome';
import { useSockets } from '../Providers/SocketProvider';
import FriendSideBar from '../components/FriendSideBar';
import { fetchUserById } from '../api/user';

const Chat: Component = () => {
  const [state] = useStore();
  const roomId = () => state.chat.roomId;
  const friendId = () => state.chat.friendId;
  const [currentRoom] = createResource(roomId, async (id: number) => {
    const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
    return res.data;
  });
  const [sockets] = useSockets();

  const [friend] = createResource(() => state.chat.friendId, fetchUserById);

  const [roomMessages, { refetch: refetchRoomMessages }] = createResource(
    roomId,
    async (id: number) => {
      try {
        return await chatApi.getMessagesByRoomId(id);
      } catch (err) {
        console.log(err);
      }
    },
    { initialValue: [] },
  );
  const [friendMessages, { refetch: refetchFriendMessages }] = createResource(
    friendId,
    chatApi.getFriendMessages,
  );

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

  const onSendMessageToFriend = (message: string) => {
    if (state.chat.friendId && friend()) {
      chatApi
        .sendDm({ user_id: friend()!.id, message: message })
        .then(() => {})
        .catch((err: AxiosError<{ message: string }>) => {
          notifyError(err.response?.data.message as string);
        });
    }
  };

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; message: Message };
        res = JSON.parse(e.data);
        if (res.event === 'chat_room_msg') {
          refetchRoomMessages();
        } else if (res.event === 'chat_dm') {
          refetchFriendMessages();
        }
      });
    }
  });

  return (
    <div class="grid grid-cols-6 h-95">
      <div class="flex row-span-4 flex-col col-span-1 border-x-header-menu border-x">
        <ChatSideBar />
      </div>
      <div class="col-span-4 w-full flex flex-col h-95 pl-1 pr-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatMessagesBox
              messages={roomMessages()!}
              onSendMessage={onSendMessageToRoom}
            />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <ChatMessagesBox
              messages={friendMessages()!}
              onSendMessage={onSendMessageToFriend}
            />
          </Match>
          <Match when={state.chatUi.tab === TAB.HOME}>
            <ChatHome />
          </Match>
        </Switch>
      </div>
      <div class="flex relative row-span-4 flex-col border-x shadow-md border-x-header-menu col-span-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatRightSideBar />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <Show when={friend()}>
              <FriendSideBar friend={friend()!} />
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default Chat;
