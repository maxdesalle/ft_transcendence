import { useNavigate } from 'solid-app-router';
import { Component, onCleanup, onMount } from 'solid-js';
import { p5 } from '../game/newPong';
import { sketch } from '../game/pong';

const Pong: Component = () => {
  let ref: any;
  let game: typeof p5;
  let id: any;
  const navigate = useNavigate();

  onMount(() => {
    game = sketch(p5, navigate);
    game.setRef(ref);
    game.setup();
    id = setInterval(() => game.draw(), 0);
  });

  onCleanup(() => {
    game.deleteAll();
    clearInterval(id);
  });

  return (
    <div class="flex flex-col mt-3 items-center">
      <canvas ref={ref} id="pongCanvas"></canvas>
    </div>
  );
};

export default Pong;
