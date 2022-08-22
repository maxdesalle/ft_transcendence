import Scrollbars from 'solid-custom-scrollbars';
import { Component, createEffect, createResource, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
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
      <h1 class="text-2xl text-center py-5 text-white">Leaderboard</h1>
      <div class="border-gray-200 p-3 relative bg-slate-600 text-white">
        <div class="flex justify-between sticky">
          <p>Rank</p>
          <p>Player</p>
          <p>Points</p>
        </div>
      </div>
      <Show when={ladder()}>
        <Scrollbars
          style={{
            height: '80vh',
          }}
        >
          <table class="w-full">
            <tbody class="text-white bg-skin-header-background">
              <For each={ladder()}>
                {(player) => (
                  <tr>
                    <td class="p-2 border border-gray-600 text-center">
                      {player.rank}
                    </td>
                    <td class="p-2 flex items-center border border-gray-600 text-start">
                      <p class="pl-3">{player.display_name}</p>
                    </td>
                    <td class="p-2 border border-gray-600 text-center">
                      {player.points}
                    </td>
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
