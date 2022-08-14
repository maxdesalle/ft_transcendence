import {
  Component,
  createEffect,
  createResource,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js';
import ChatSideBar from '../components/ChatSideBar';
import ChatMessagesBox from '../components/ChatMessagesBox';
import ChatRightSideBar from '../components/ChatRightSideBar';
import 'simplebar';
import { blockUser, chatApi } from '../api/chat';
import { TAB, useStore } from '../store/index';
import toast from 'solid-toast';
import { routes } from '../api/utils';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import { api } from '../utils/api';
import { createTurboResource } from 'turbo-solid';
import { User } from '../types/user.interface';
import Avatar from '../components/Avatar';
import { generateImageUrl } from '../utils/helpers';
import { AxiosError } from 'axios';
import autoAnimate from '@formkit/auto-animate';
import { Link } from 'solid-app-router';
import { Message } from 'postcss';

const Chat: Component = () => {
  const [state] = useStore();
  const notifyError = (msg: string) => toast.error(msg);
  const notifySuccess = (msg: string) => toast.success(msg);
  const roomId = () => state.chat.roomId;
  const friendId = () => state.chat.friendId;
  const [currentRoom] = createResource(roomId, async (id: number) => {
    const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
    return res.data;
  });
  const [blockedFriends, { refetch }] = createTurboResource<number[]>(
    () => routes.blocked,
  );
  let ref: any;

  onMount(() => {
    autoAnimate(ref);
  });
  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const selectedFriend = () =>
    friends()?.find((friend) => friend.id === state.chat.friendId);

  const [roomMessages, { refetch: updateRoomMessages }] = createResource(
    roomId,
    async (id: number) => {
      try {
        return await chatApi.getMessagesByRoomId(id);
      } catch (err) {
        console.log(err);
      }
    },
  );
  const [friendMessages, { refetch: updateFriendMessages }] = createResource(
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

  const isBlocked = () =>
    blockedFriends()?.includes(selectedFriend()?.id as number);

  const onSendMessageToFriend = (message: string) => {
    if (state.chat.friendId && friends) {
      const friend = friends()!.find((f) => f.id === state.chat.friendId);
      if (friend) {
        chatApi
          .sendDm({ user_id: friend.id, message: message })
          .then(() => {})
          .catch((err: AxiosError<{ message: string }>) => {
            notifyError(err.response?.data.message as string);
          });
      }
    }
  };

  const onBlockFriend = () => {
    if (!selectedFriend()) return;
    blockUser({ user_id: selectedFriend()!.id })
      .then(() => {
        refetch();
        notifySuccess(`${selectedFriend()!.display_name} blocked successfully`);
      })
      .catch(() => {
        notifyError(`${selectedFriend()!.display_name} cant be blocked`);
      });
  };

  const onUnblockFriend = () => {
    if (!selectedFriend()) return;
    chatApi
      .unblockUser({ user_id: selectedFriend()!.id })
      .then(() => {
        refetch();
        notifySuccess(
          `${selectedFriend()!.display_name} unblocked successfully`,
        );
      })
      .catch(() => {
        notifyError(`${selectedFriend()!.display_name} cant be unblocked`);
      });
  };

  onMount(() => {
    state.ws.addEventListener('message', (e) => {
      let res: { event: WsNotificationEvent; message: Message };
      res = JSON.parse(e.data);
      if (res.event === 'chat_room_msg') {
        updateRoomMessages();
      } else if (res.event === 'chat_dm') {
        updateFriendMessages();
      }
    });
  });

  return (
    <div class="grid grid-cols-6 h-full">
      <div class="flex row-span-4 flex-col col-span-1 border-x-header-menu border-x">
        <ChatSideBar />
      </div>
      <div class="col-span-4 flex flex-col pl-1 pr-1 h-full">
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
        </Switch>
      </div>
      {/* TODO: adapt when it's on the friend tab or room tab */}
      <div
        ref={ref}
        class="flex relative row-span-4 flex-col border-x shadow-md border-x-header-menu col-span-1"
      >
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatRightSideBar />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <div class="pt-5 px-2 w-full">
              <Show when={selectedFriend()} fallback={<p>Select a friend</p>}>
                <div class="flex flex-col">
                  <div class="mb-2 flex items-center text-white">
                    <Avatar
                      imgUrl={
                        selectedFriend()!.avatarId
                          ? generateImageUrl(selectedFriend()!.avatarId)
                          : undefined
                      }
                    />
                    <div class="flex flex-col pl-3">
                      <h1 class="text-lg">{selectedFriend()!.display_name}</h1>
                      <p class="text-sm">status: ...</p>
                    </div>
                  </div>
                  <button type="button" class="btn-primary">
                    Invite to play
                  </button>
                  <Link
                    class="btn-primary"
                    href={`/profile/${selectedFriend()?.id}`}
                  >
                    Profile
                  </Link>
                  <Show when={isBlocked() === false}>
                    <button
                      onClick={onBlockFriend}
                      type="button"
                      class="btn-secondary"
                    >
                      Block
                    </button>
                  </Show>
                  <Show when={isBlocked()}>
                    <button
                      onClick={onUnblockFriend}
                      type="button"
                      class="btn-primary"
                    >
                      Unblock
                    </button>
                  </Show>
                </div>
              </Show>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default Chat;
