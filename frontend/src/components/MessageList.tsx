import { Component, For, Show } from "solid-js";
import { Message } from "../types/chat.interface";
import MessageCard from "./MessageCard";

const MessageList: Component<{ messages?: Message[]; id?: number }> = (
  props
) => {
  return (
    <Show when={props.messages}>
      <For each={props.messages}>
        {(msg) => (
          <MessageCard
            title={msg.user_id === props.id ? "" : `username`}
            message={msg}
            position={
              msg.user_id === props.id
                ? "bg-blue-400"
                : "self-start bg-orange-400"
            }
          />
        )}
      </For>
    </Show>
  );
};

export default MessageList;
