import { Component, Show } from 'solid-js';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const Avatar: Component<{
  imgUrl?: string;
  color?: string;
  class?: string;
}> = (props) => {
  return (
    <div class={`${props.class} relative`}>
      <img
        style={{
          'min-height': '40px',
          'min-width': '40px',
        }}
        src={props.imgUrl ? props.imgUrl : defaultAvatar}
        class="h-10 w-10 rounded-full"
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
