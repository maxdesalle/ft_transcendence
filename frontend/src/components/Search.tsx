import autoAnimate from '@formkit/auto-animate';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import { BiSearch } from 'solid-icons/bi';
import { Component, createSignal, JSXElement, onMount, Setter } from 'solid-js';
import usePopper from 'solid-popper';
import CreateRoom from './admin/createRoom';
import Modal from './Modal';

const Search: Component<{
  setKeyword: Setter<string>;
  popperMsg: string;
  children: JSXElement;
  placeHolder?: string;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal<any>();
  const [popper, setPopper] = createSignal<any>();
  let ref: any;
  const popperInstance = usePopper(anchor, popper, {
    placement: 'right',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });
  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];
  const show = () => {
    popper().classList.toggle('hidden');
    popperInstance()?.update();
  };

  const hide = () => {
    popper().classList.toggle('hidden');
  };

  onMount(() => {
    autoAnimate(anchor());
    // showEvents.forEach((event) => {
    //   ref.addEventListener(event, show);
    // });

    // hideEvents.forEach((event) => {
    //   ref.addEventListener(event, hide);
    // });
  });

  return (
    <div class="flex items-center pl-2 pb-2">
      <div class="hidden lg:flex w-2/3 rounded-md p-1 border border-header-menu">
        <BiSearch size={24} />
        <input
          onInput={(e) => props.setKeyword(e.currentTarget.value)}
          class="focus:outline-none text-sm w-full bg-skin-page"
          type="text"
          placeholder={props.placeHolder ? `${props.placeHolder}` : ''}
          name="search"
          autocomplete="off"
        />
      </div>
      <div ref={setAnchor} class="ml-5 lg:self-start">
        <button onclick={() => setIsOpen(!isOpen())}>
          <AiOutlinePlusCircle ref={ref} size={26} />
        </button>
        <p
          ref={setPopper}
          class="hidden p-1 pl-2 z-10  pr-2 bg-blue-500 rounded-sm shadow-md"
        >
          {props.popperMsg}
        </p>
        <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
          <div class="p-2 bg-skin-header-background rounded-md">
            {props.children}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Search;
