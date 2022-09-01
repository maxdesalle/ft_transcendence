import Scrollbars from 'solid-custom-scrollbars';
import { Component, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { LadderDto } from '../types/stats.interface';

const LeaderBoard: Component = () => {
  const [ladder] = createTurboResource<LadderDto[]>(() => routes.ladder);

  return (
    <div class="flex flex-col h-full">
      <h1 class="text-2xl text-center py-5 ">Leaderboard</h1>
      <Show when={ladder()}>
        <Scrollbars
          style={{
            height: '75vh',
          }}
        >
          <table class="w-full table">
            <thead class="border border-base-300 font-semibold">
              <tr>
                <th class="text-lg">Rank</th>
                <th class="text-lg">Player</th>
                <th class="text-lg">Points</th>
              </tr>
            </thead>
            <tbody class="border scrollbar-thin border-base-300 w-full shadow-md">
              <For each={ladder()}>
                {(player) => (
                  <tr class="w-full">
                    <td>{player.rank}</td>
                    <td>{player.display_name}</td>
                    <td>{player.points}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Scrollbars>
      </Show>
    </div>
  );
};

export default LeaderBoard;
