import { Component, createEffect, Show } from 'solid-js';
import defaultAvatar from '../../../backend/images/avatardefault.png';

type AvatarType = 'rounded' | 'rounded-full';

const Avatar: Component<{
  imgUrl?: string;
  color?: string;
}> = (props) => {
  return (
    <>
      <div class={`relative rounded-full w-8 h-8 bg-blue-400 dark:bg-gray-600`}>
        <img
          class={`w-8 h-8 rounded-full bg-blue-400`}
          src={props.imgUrl ? props.imgUrl : defaultAvatar}
        />
        <path
          fill-rule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clip-rule="evenodd"
        ></path>
      </div>
    </>
  );
};

export default Avatar;
