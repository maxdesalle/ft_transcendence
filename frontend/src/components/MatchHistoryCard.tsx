import { Component, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO } from '../types/stats.interface';
import { User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const MatchHistoryCard: Component<{ match: MatchDTO }> = (props) => {
  const [player1] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p1.user_id}`,
  );
  const [player2] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p2.user_id}`,
  );

  return (
    <Show when={player1() && player2()}>
      <div class="flex py-2 px-4 justify-between text-white border border-gray-700 shadow-md">
        <div>
          <img
            class="w-12 h-12 rounded-full"
            src={
              player1()?.avatarId
                ? generateImageUrl(player1()!.avatarId)
                : defaultAvatar
            }
          />
          <h1>{props.match.p1.display_name}</h1>
          <p class="text-center">{props.match.p1Score}</p>
        </div>
        <h1 class="mt-auto mb-auto">VS</h1>
        <div>
          <img
            class="w-12 h-12 rounded-full"
            src={
              player2()?.avatarId
                ? generateImageUrl(player2()!.avatarId)
                : defaultAvatar
            }
          />
          <h1>{props.match.p2.display_name}</h1>
          <p class="text-center">{props.match.p2Score}</p>
        </div>
      </div>
    </Show>
  );
};

export default MatchHistoryCard;
