import { BiSearch } from 'solid-icons/bi';
import { Component, createSignal, For, onMount, Setter, Show } from 'solid-js';
import { RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import usePopper from 'solid-popper';
import Modal from './Modal';
import CreateRoom from './admin/createRoom';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { useStore } from '../store';

//maybe use a chat context
const ChatSideBar: Component<{
  user: User;
  setRoomId: Setter<number>;
  setCurrentRoom: Setter<RoomInfoShort>;
}> = (props) => {
  const [keyword, setKeyword] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal<any>();
  const [popper, setPopper] = createSignal<any>();
  const [state, { getRoomById }] = useStore();

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

  let ref: any;

  const show = () => {
    popper().classList.toggle('hidden');
    popperInstance()?.update();
  };

  const hide = () => {
    popper().classList.toggle('hidden');
  };

  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];

  onMount(() => {
    showEvents.forEach((event) => {
      ref.addEventListener(event, show);
    });

    hideEvents.forEach((event) => {
      ref.addEventListener(event, hide);
    });
  });

  return (
    <>
      <div class="flex items-center mt-4 pl-4">
        <div class="flex items-center w-2/3 rounded-md p-1 border border-header-menu">
          <BiSearch size={22} />
          <input
            onInput={(e) => setKeyword(e.currentTarget.value)}
            class="focus:outline-none text-sm w-full bg-skin-page"
            type="text"
            placeholder="Search friends or groups"
            name="search"
            autocomplete="off"
          />
        </div>
        <div ref={setAnchor} class="ml-5">
          <button onclick={() => setIsOpen(!isOpen())}>
            <AiOutlinePlusCircle ref={ref} size={26} />
          </button>
          <p
            ref={setPopper}
            class="hidden p-1 pl-2 z-10  pr-2 bg-blue-500 rounded-sm shadow-md"
          >
            Create new room
          </p>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <div class="p-2 bg-skin-header-background rounded-md">
              <CreateRoom ref={popper()} />
            </div>
          </Modal>
        </div>
      </div>
      <div class="row-span-4 px-2 mt-5">
        <Show when={state.chat.rooms}>
          <For
            each={state.chat.rooms!.filter((room) =>
              room.room_name
                .toLocaleLowerCase()
                .includes(keyword().toLocaleLowerCase()),
            )}
          >
            {(room) => (
              <div
                onClick={() => {
                  props.setRoomId(room.room_id);
                  props.setCurrentRoom(room);
                }}
                class="flex p-2 items-center hover:border hover:rounded-md hover:border-header-menu"
              >
                <HiSolidUserGroup color={'#000'} size={24} />
                <div class="pl-2 text-white hover:text-gray-400">
                  <p class="font-bold first-letter:capitalize">
                    {room.room_name}
                  </p>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </>
  );
};

export default ChatSideBar;
