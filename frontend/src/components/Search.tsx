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
  class?: string;
  children: JSXElement;
  placeHolder?: string;
}> = (props) => {
  return (
    <div
      class={`flex items-center`}
      classList={{ [props.class as any]: !!props.class }}
    >
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
    </div>
  );
};

export default Search;
