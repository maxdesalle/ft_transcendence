import { Component, createEffect, Show } from 'solid-js';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const Avatar: Component<{
  imgUrl?: string;
  color?: string;
}> = (props) => {
  return (
    <div class="relative">
      <img
        src={props.imgUrl ? props.imgUrl : defaultAvatar}
        class="w-10 h-10 rounded-full"
        alt="user avatar"
      />
      <Show when={props.color}>
        <span
          class={`bottom-0 left-7 absolute  w-3.5 h-3.5 ${props.color} border-2 border-white dark:border-gray-800 rounded-full`}
        ></span>
      </Show>
    </div>
  );
};

export default Avatar;
