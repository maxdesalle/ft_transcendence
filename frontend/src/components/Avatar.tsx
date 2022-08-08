import { Component, Show } from 'solid-js';
import { useStore } from '../store';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const Avatar: Component<{ imgUrl?: string }> = (props) => {
  const [state] = useStore();
  return (
    <>
      <Show when={state.currentUser.userData?.avatarId}>
        <div class="relative w-8 h-8 bg-blue-400 rounded-full dark:bg-gray-600">
          <img
            class="w-8 h-8 bg-blue-400 rounded-full"
            src={props.imgUrl ? props.imgUrl : defaultAvatar}
          />
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          ></path>
          <span
            aria-hidden="true"
            class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full ring ring-white"
          ></span>
        </div>
      </Show>
    </>
  );
};

export default Avatar;
