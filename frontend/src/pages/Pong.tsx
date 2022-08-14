import p5Type from 'p5';
import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { p5 } from '../game/newPong';
import { sketch } from '../game/pong';

const Pong: Component = () => {
  let ref: any;

  onMount(() => {
    const game = sketch(p5);
    game.setRef(ref);
    game.setup(ref);
    setInterval(() => game.draw(), 0);
  });

  return (
    <div class="flex flex-col mt-3 items-center">
      <canvas ref={ref} id="pongCanvas"></canvas>
    </div>
  );
};

export default Pong;
