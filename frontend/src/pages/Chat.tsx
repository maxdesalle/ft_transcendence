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
import { blockUser, chatApi } from '../api/chat';
import { TAB, useStore } from '../store/index';
import toast from 'solid-toast';
import { routes } from '../api/utils';
import { RoomInfo } from '../types/chat.interface';
import { api } from '../utils/api';
import { createTurboResource } from 'turbo-solid';
import { User } from '../types/user.interface';
import Avatar from '../components/Avatar';
import { generateImageUrl } from '../utils/helpers';
import { AxiosError } from 'axios';

const Chat: Component = () => {
  const [state] = useStore();
  const notifyError = (msg: string) => toast.error(msg);
  const notifySuccess = (msg: string) => toast.success(msg);
  const roomId = () => state.chat.roomId;
  const [currentRoom, { refetch }] = createResource(
    roomId,
    async (id: number) => {
      const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
      return res.data;
    },
  );
  const [blockedFriends] = createTurboResource(() => routes.blocked);

  const [friends] = createTurboResource<User[]>(() => routes.friends);
  const selectedFriend = () =>
    friends()?.find((friend) => friend.id === state.chat.friendId);

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
    if (state.chat.friendId && friends) {
      const friend = friends()!.find((f) => f.id === state.chat.friendId);
      if (friend) {
        chatApi
          .sendDm({ user_id: friend.id, message: message })
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
        notifySuccess(`${selectedFriend()!.display_name} blocked successfully`);
      })
      .catch(() => {
        notifyError(`${selectedFriend()!.display_name} cant be blocked`);
      });
  };

  createEffect(() => {
    console.log(selectedFriend());
  });

  return (
    <div class="grid grid-cols-6 h-full">
      <div class="flex row-span-4 flex-col col-span-1 border-x-header-menu border-x">
        <ChatSideBar />
      </div>
      <div class="col-span-4 flex flex-col pl-1 pr-1 ">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatMessagesBox
              messages={state.chat.roomMsgs!}
              onSendMessage={onSendMessageToRoom}
            />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <ChatMessagesBox
              messages={state.chat.friendMsgs!}
              onSendMessage={onSendMessageToFriend}
            />
          </Match>
        </Switch>
      </div>
      {/* TODO: adapt when it's on the friend tab or room tab */}
      <div class="flex relative row-span-4 flex-col border-x shadow-md border-x-header-menu col-span-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatRightSideBar />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <div class="pt-5 px-2 w-full">
              <Show when={selectedFriend()} fallback={<p>Select a friend</p>}>
                <div class="flex flex-col">
                  <div class="mb-2 mx-auto">
                    <Avatar
                      imgUrl={
                        selectedFriend()!.avatarId
                          ? generateImageUrl(selectedFriend()!.avatarId)
                          : undefined
                      }
                    />
                  </div>
                  <button
                    type="button"
                    class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                  >
                    Invite to play
                  </button>
                  <button
                    onClick={onBlockFriend}
                    type="button"
                    class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                  >
                    Block
                  </button>
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
