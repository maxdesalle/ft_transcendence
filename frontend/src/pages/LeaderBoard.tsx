import Scrollbars from 'solid-custom-scrollbars';
import {
  Component,
  createEffect,
  createMemo,
  For,
  onMount,
  Show,
  JSX,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { LadderDto } from '../types/stats.interface';

const LeaderBoard: Component<{
  limit?: number;
  title: string;
  class?: string;
  style?: JSX.CSSProperties;
}> = (props) => {
  const [ladder, { refetch }] = createTurboResource<LadderDto[]>(
    () => routes.ladder,
  );

  onMount(() => {
    refetch();
  });

  const slice = createMemo(() => {
    if (props.limit) {
      return ladder()?.slice(0, props.limit);
    }
    return ladder();
  });

  return (
    <div
      classList={{ [props.class as any]: !!props.class }}
      class="flex flex-col w-full"
    >
      <h1 class="text-2xl text-center py-5 ">{props.title}</h1>
      <Show when={ladder()}>
        <Scrollbars style={{ ...props.style }}>
          <table class="w-full table">
            <thead class="border border-base-300 font-semibold">
              <tr>
                <th class="text-lg">Rank</th>
                <th class="text-lg">Player</th>
                <th class="text-lg">Points</th>
              </tr>
            </thead>
            <tbody class="border scrollbar-thin border-base-300 w-full shadow-md">
              <Show when={slice()}>
                <For each={slice()}>
                  {(player) => (
                    <tr class="w-full">
                      <td>{player.rank}</td>
                      <td>{player.display_name}</td>
                      <td>{player.points}</td>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </Scrollbars>
      </Show>
    </div>
  );
};

export default LeaderBoard;
