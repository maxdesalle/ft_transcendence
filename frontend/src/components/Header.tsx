import { Link } from 'solid-app-router';
import { Component, createSignal, For, Show } from 'solid-js';
import logo from '../assets/logo.png';
import { BiSearchAlt2 } from 'solid-icons/bi';
import HeaderProfileMenu from './HeaderProfileMenu';
import Modal from './Modal';
import Avatar from './Avatar';
import { useStore } from '../store/index';
import SearchUserCard from './SearchUserCard';
import { generateImageUrl } from '../utils/helpers';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const LINKS = ['pong', 'viewer', 'chat'];

const Header: Component = () => {
  const [keyword, setKeyword] = createSignal<string>('');
  const [state, { sendFriendReq }] = useStore();

  const [isOpen, setIsOpen] = createSignal(false);
  let ref: any;

  return (
    <>
      <header class="flex items-center relative z-20 bg-skin-header-background py-1 px-6 justify-between">
        <div class="flex items-center">
          <Link href="/">
            <img class="w-9 rounded-xl mr-2 h-8" src={logo} alt="logo" />
          </Link>
          <span class="flex items-center rounded-md bg-inherit text-slate-300 h-8 border shadow-md p-1 border-header-menu">
            <BiSearchAlt2 size={22} />
            <input
              onInput={(e) => setKeyword(e.currentTarget.value)}
              placeholder="search user"
              class="p-1 bg-inherit focus:outline-none"
              autocomplete="off"
            />
          </span>
        </div>
        <ul class="flex p-1 justify-between w-64">
          <For each={LINKS}>
            {(link) => (
              <li class="text-white first-letter:capitalize">
                {' '}
                <Link href={`/${link}`}>{link}</Link>{' '}
              </li>
            )}
          </For>
        </ul>
        <div class="relative">
          <button onClick={() => setIsOpen(!isOpen())}>
            <Avatar
              imgUrl={
                state.currentUser.userData?.avatarId
                  ? `${generateImageUrl(state.currentUser.userData.avatarId)}`
                  : defaultAvatar
              }
            />
          </button>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <Show when={state.currentUser.userData}>
              <div class="bg-skin-menu-background w-60 absolute border-header-menu -right-4 border shadow-sm p-2 -top-1">
                <HeaderProfileMenu user={state.currentUser.userData!} />
              </div>
            </Show>
          </Modal>
        </div>
      </header>
      <Show when={keyword()}>
        <div class="relative">
          <div class="absolute top-0 z-10 ml-16">
            <For
              each={state.users
                ?.slice(0)
                ?.filter((user) =>
                  user.display_name
                    .toLocaleLowerCase()
                    .includes(keyword().toLocaleLowerCase()),
                )
                .slice(0, 15)}
            >
              {(user) => (
                <div ref={ref} class="w-60">
                  <SearchUserCard
                    onClick={() => {
                      if (sendFriendReq) {
                        sendFriendReq(user.id);
                      }
                    }}
                    user={user}
                  />
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Header;
