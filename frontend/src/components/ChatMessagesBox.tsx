import { compareAsc, parseISO } from "date-fns";
import { IoSend } from "solid-icons/io";
import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { Message, RoomInfoShort } from "../types/chat.interface";
import { User } from "../types/user.interface";
import Avatar from "./Avatar";
import MessageList from "./MessageList";
import Scrollbars from "solid-custom-scrollbars";

const ChatMessagesBox: Component<{
  currentRoom: RoomInfoShort | undefined;
  messages: Message[];
  user: User;
}> = (props) => {
  let chatRef: any;

  createEffect(() => {
    props.messages;
  });

  return (
    <Show
      when={props.currentRoom}
      fallback={<p>Click on a group or friend to display messages</p>}
    >
      <div class="flex p-2 items-center shadow- border-b border-b-header-menu">
        <Avatar />
        <p>{props.currentRoom!.room_name}</p>
      </div>
      <Suspense>
        <div class="h-82">
          <Scrollbars class="flex flex-col" ref={chatRef}>
            <Show when={props.messages}>
              <MessageList
                messages={props.messages
                  .slice()
                  .sort((a, b) =>
                    compareAsc(
                      parseISO(a.timestamp.toString()),
                      parseISO(b.timestamp.toString())
                    )
                  )}
                id={props.user.id}
              />
            </Show>
          </Scrollbars>
        </div>
      </Suspense>
    </Show>
  );
};

export default ChatMessagesBox;
