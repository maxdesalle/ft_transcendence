import {
  Component,
  createEffect,
  createSignal,
  Show,
  splitProps,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO } from '../types/stats.interface';
import { User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { useParams } from 'solid-app-router';

const MatchHistoryCard: Component<{ match: MatchDTO }> = (props) => {
  const [player1] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p1.user_id}`,
  );
  const [player2] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p2.user_id}`,
  );

  // const [match] = splitProps(props, ["match"])

  const params = useParams();
  const [user] = createTurboResource<User>(
    () => `${routes.users}/${params.id}`,
  );
  // const [currentUserWon, setCurrentUserWon] = createSignal(false);

  const winner = () =>
    props.match.p1Score > props.match.p2Score ? props.match.p1 : props.match.p2;

  const currentUserWon = () => winner().user_id === user()?.id;

  // createEffect(() => {
  //   if (user()) {
  //     if (winner().user_id === user()!.id) {
  //       setCurrentUserWon(true);
  //     } else {
  //       setCurrentUserWon(false);
  //     }
  //   }
  // });

  return (
    <Show when={player1() && player2()}>
      <div
        classList={{
          'bg-blue-700': currentUserWon(),
          'bg-red-700': !currentUserWon(),
        }}
        class={`flex py-2 px-4 justify-between text-white border rounded-sm`}
      >
        <div class="flex flex-col items-center">
          <img
            class="w-12 h-12 rounded-full"
            src={
              player1()?.avatarId
                ? generateImageUrl(player1()!.avatarId)
                : defaultAvatar
            }
          />
          <h1 class="capitalize">{props.match.p1.display_name}</h1>
          <p class="text-center">{props.match.p1Score}</p>
        </div>
        <h1 class="mt-auto mb-auto">VS</h1>
        <div class="flex flex-col items-center">
          <img
            class="w-12 h-12 rounded-full"
            src={
              player2()?.avatarId
                ? generateImageUrl(player2()!.avatarId)
                : defaultAvatar
            }
          />
          <h1 class="capitalize">{props.match.p2.display_name}</h1>
          <p class="text-center">{props.match.p2Score}</p>
        </div>
      </div>
    </Show>
  );
};

export default MatchHistoryCard;
