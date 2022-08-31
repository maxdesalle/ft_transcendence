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
  return (
    <div class="flex items-center">
      <div class="form-control">
        <label class="input-group">
          <span>
            <BiSearch size={24} />
          </span>
          <input
            onInput={(e) => props.setKeyword(e.currentTarget.value)}
            class="input w-full input-bordered focus:outline-none"
            type="text"
            placeholder={props.placeHolder ? `${props.placeHolder}` : ''}
            name="search"
            autocomplete="off"
          />
        </label>
      </div>
      {/* <div ref={setAnchor} class="ml-5 lg:self-start">
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
      </div> */}
    </div>
  );
};

export default Search;
