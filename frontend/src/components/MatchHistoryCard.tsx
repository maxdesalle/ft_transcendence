import { Component, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { MatchDTO } from '../types/stats.interface';
import { User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { useParams } from 'solid-app-router';
import ResultsCard from './ResultsCard';

const MatchHistoryCard: Component<{ match: MatchDTO }> = (props) => {
  const [player1] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p1.user_id}`,
  );
  const [player2] = createTurboResource<User>(
    () => `${routes.users}/${props.match.p2.user_id}`,
  );

  const params = useParams();
  const [user] = createTurboResource<User>(
    () => `${routes.users}/${params.id}`,
  );

  const winner = () =>
    props.match.p1Score > props.match.p2Score ? props.match.p1 : props.match.p2;

  const currentUserWon = () => winner().user_id === user()?.id;

  return (
    <Show when={player1() && player2()}>
      <div
        classList={{
          'bg-success': currentUserWon(),
          'bg-error': !currentUserWon(),
        }}
        class="grid border-b-2 border-b-gray-600 grid-cols-3 justify-between"
      >
        <ResultsCard
          position="before"
          name={props.match.p1.display_name}
          score={props.match.p1Score}
          avatarId={player1()!.avatarId}
        />
        <h1 class="m-auto">VS</h1>
        <ResultsCard
          position="after"
          name={props.match.p2.display_name}
          score={props.match.p2Score}
          avatarId={player2()!.avatarId}
        />
      </div>
    </Show>
  );
};

export default MatchHistoryCard;
