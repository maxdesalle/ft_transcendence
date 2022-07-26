import { Component, Match, Show, Suspense, Switch } from 'solid-js';
import ChatSideBar from '../components/ChatSideBar';
import ChatMessagesBox from '../components/ChatMessagesBox';
import ChatRightSideBar from '../components/ChatRightSideBar';
import 'simplebar';
import Scrollbars from 'solid-custom-scrollbars';
import { chatApi } from '../api/chat';
import { TAB, useStore } from '../store/index';

const Chat: Component = () => {
  const [state] = useStore();

  const onSendMessageToRoom = (message: string) => {
    if (!state.chat.currentRoom) return;
    chatApi.postMessageToRoom({
      room_id: state.chat.currentRoom.room_id,
      message: message,
    });
  };

  const onSendMessageToFriend = (message: string) => {
    if (state.chat.friendId) {
      const friend = state.currentUser.friends.find(
        (f) => f.id === state.chat.friendId,
      );
      if (friend) {
        chatApi.sendDm({ user_id: friend.id, message: message });
      }
    }
  };

  return (
    <div class="grid grid-cols-6 h-full">
      <div class="flex flex-col col-span-1 border-x-header-menu border-x">
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
      <div class="flex relative flex-col border-x shadow-md border-x-header-menu col-span-1">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <ChatRightSideBar />
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>Friend tab</Match>
        </Switch>
      </div>
    </div>
  );
};

export default Chat;
