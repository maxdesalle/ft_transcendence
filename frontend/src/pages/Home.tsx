import { useNavigate } from 'solid-app-router';
import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { useStore } from '../store';

const Home: Component = () => {
  const [state, { toggleMatchMaking }] = useStore();
  const [ref, setRef] = createSignal<any>();
  const [matchFound, setMatchFound] = createSignal<{
    event: string;
    user_id: number;
  }>();
  const [buttonText, setButtonText] = createSignal('Launch matchmaking');

  const navigate = useNavigate();

  onMount(() => {
    state.pong.ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'pong: invitation') {
        setMatchFound(res);
      }
    });
  });

  onCleanup(() => {
    state.pong.ws.removeEventListener('message', (e) => {
      console.log('removing event: ', e);
    });
  });

  const onPlay = () => {
    const message = { event: 'play' };
    state.pong.ws.send(JSON.stringify(message));
    toggleMatchMaking(true);
    ref().classList.toggle('animate-pulse');
    setButtonText('Searching for a game');
  };

  return (
    <>
      <button
        // style="border-top-color:transparent"
        ref={setRef}
        onClick={onPlay}
        class="w-36 h-36 border-4 text-white bg-blue-600 flex items-center border-purple-600 shadow-md border-solid rounded-full"
      >
        {buttonText()}
      </button>
    </>
  );
};

export default Home;
