import { Component, Show } from 'solid-js';
import { generateImageUrl } from '../utils/helpers';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const ResultsCard: Component<{
  avatarId: number;
  name: string;
  score: number;
  position: 'before' | 'after';
}> = (props) => {
  return (
    <div
      class="flex items-center p-4"
      classList={{ 'justify-self-end': props.position === 'after' }}
    >
      <Show when={props.position === 'before'}>
        <img
          class="w-12 h-12 rounded-full pr-2"
          src={
            props.avatarId ? generateImageUrl(props.avatarId) : defaultAvatar
          }
        />
      </Show>
      <div class="flex flex-col">
        <h1 class="capitalize">{props.name}</h1>
        <p class="text-center">{props.score}</p>
      </div>
      <Show when={props.position === 'after'}>
        <img
          class="w-12 h-12 rounded-full pl-2"
          src={
            props.avatarId ? generateImageUrl(props.avatarId) : defaultAvatar
          }
        />
      </Show>
    </div>
  );
};

export default ResultsCard;
