import Scrollbars from 'solid-custom-scrollbars';
import { Component, For } from 'solid-js';
import Avatar from '../components/Avatar';
import { useStore } from '../store';

const LeaderBoard: Component = () => {
  const [state] = useStore();
  return (
    <>
      <div class="border-gray-200 p-3 relative bg-slate-600 text-white">
        <div class="flex justify-between sticky">
          <p>Rank</p>
          <p>Player</p>
          <p>Points</p>
        </div>
      </div>
      <Scrollbars>
        <table class="w-full">
          <tbody class="text-white bg-skin-header-background">
            <For each={state.pong.ladder}>
              {(player) => (
                <tr>
                  <td class="p-2 border border-gray-600 text-center">
                    {player.rank}
                  </td>
                  <td class="p-2 flex items-center border border-gray-600 text-start">
                    <Avatar />
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
    </>
  );
};

export default LeaderBoard;
