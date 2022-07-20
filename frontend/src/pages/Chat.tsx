import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js';
import { urls } from '../api/utils';
import { Message, RoomInfoShort } from '../types/chat.interface';
import ChatSideBar from '../components/ChatSideBar';
import ChatMessagesBox from '../components/ChatMessagesBox';
import ChatRightSideBar from '../components/ChatRightSideBar';
import 'simplebar';
import Scrollbars from 'solid-custom-scrollbars';
import ChatForm from '../components/ChatForm';
import { chatApi } from '../api/chat';
import { useStore } from '../store/index';
import { unwrap } from 'solid-js/store';

const Chat: Component = () => {
  const [state, { loadMessages, mutate }] = useStore();

  const [message, setMessage] = createSignal('');
  const onSendMessage = () => {
    if (!state.chat.currentRoom) return;
    chatApi.postMessageToRoom({
      room_id: state.chat.currentRoom.room_id,
      message: message(),
    });
    setMessage('');
  };
  let ws: WebSocket;

  onMount(() => {
    ws = new WebSocket(urls.wsUrl);
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'chat_room_msg') {
        if (mutate) {
          mutate(res.message as Message);
        }
      }
    });
  });

  createEffect(() => {
    if (loadMessages && state.chat.currentRoom) {
      loadMessages(state.chat.currentRoom.room_id);
    }
  });

  onCleanup(() => {
    ws.close();
  });

  return (
    <div class="grid grid-cols-6 h-90">
      <Suspense>
        <div class="flex flex-col col-span-1 border-x-header-menu border-x">
          <Scrollbars class="bg-red-600">
            <ChatSideBar />
          </Scrollbars>
        </div>
        <div class="col-span-4 flex flex-col pl-1 pr-1 ">
          <ChatMessagesBox />
          <Show when={state.chat.currentRoom}>
            <ChatForm
              message={message()}
              setMessage={setMessage}
              onSendMessage={onSendMessage}
            />
          </Show>
        </div>
        <div class="flex relative flex-col border-x shadow-md border-x-header-menu col-span-1">
          <ChatRightSideBar />
        </div>
      </Suspense>
    </div>
  );
};

export default Chat;
