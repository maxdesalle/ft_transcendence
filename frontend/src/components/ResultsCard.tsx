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
      <img
        class="w-12 h-12 rounded-full pl-2"
        src={props.avatarId ? generateImageUrl(props.avatarId) : defaultAvatar}
      />
      <div class="flex pl-4 flex-col">
        <h1 class="capitalize font-semibold">{props.name}</h1>
        <p class="text-center">Score: {props.score}</p>
      </div>
    </div>
  );
};

export default ResultsCard;
