import autoAnimate from "@formkit/auto-animate";
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

const Dropdown: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  let ref: any;

  onMount(() => {
    autoAnimate(ref);
  });
  return (
    <div ref={ref} class="flex relative flex-col px-4 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen())}
        class="hidden sm:inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
        type="button"
      >
        <svg
          class="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
        </svg>
      </button>
      <Show when={isOpen()}>
        <div class="z-10 float-left top-14 right-0 absolute w-44 text-base flex flex-col list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
          <button class="btn-primary">Send message</button>
          <button class="btn-primary">Profile</button>
          <button class="btn-secondary">Block</button>
        </div>
      </Show>
    </div>
  );
};

export default Dropdown;
