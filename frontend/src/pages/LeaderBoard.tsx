import Scrollbars from 'solid-custom-scrollbars';
import { Component, createResource, For, Show } from 'solid-js';
import { routes } from '../api/utils';
import { LadderDto } from '../types/stats.interface';
import { api } from '../utils/api';

const LeaderBoard: Component = () => {
  // const [ladder] = createTurboResource<LadderDto[]>(() => routes.ladder);
  const [ladder] = createResource(async () => {
    const res = await api.get<LadderDto[]>(routes.ladder);
    return res.data;
  });

  return (
    <div class="flex flex-col">
      <h1 class="text-2xl text-center py-5 ">Leaderboard</h1>
      <Show when={ladder()}>
        <table class="w-full table overflow-x-hidden">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody class="border overflow-scroll border-base-300 w-full shadow-md">
            <For each={ladder()}>
              {(player) => (
                <tr class="w-full">
                  <td class="p-2 text-center">{player.rank}</td>
                  <td class="p-2 text-start">{player.display_name}</td>
                  <td class="p-2 text-center">{player.points}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
};

export default LeaderBoard;
