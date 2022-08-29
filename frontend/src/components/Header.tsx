import { Link } from 'solid-app-router';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import logo from '../assets/logo.png';
import { BiSearchAlt2 } from 'solid-icons/bi';
import HeaderProfileMenu from './HeaderProfileMenu';
import Modal from './Modal';
import Avatar from './Avatar';
import { useStore } from '../store/all';
import SearchUserCard from './SearchUserCard';
import { generateImageUrl } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import { api } from '../utils/api';
import toast from 'solid-toast';
import autoAnimate from '@formkit/auto-animate';
import { AxiosError } from 'axios';
import { useAuth } from '../Providers/AuthProvider';
import { IoChatbubblesSharp } from 'solid-icons/io';
import GameInviteNotif from './GameInviteNotif';
import FriendRequests from './FriendRequest';
const LINKS = ['chat', 'leaderboard'];

const Header: Component = () => {
  const [keyword, setKeyword] = createSignal<string>('');
  const [state] = useStore();
  const [users] = createTurboResource<User[]>(() => routes.users);
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [auth] = useAuth();
  const notifySuccess = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const [isOpen, setIsOpen] = createSignal(false);
  const [isNotifOpen, setIsNotifOpen] = createSignal(false);
  let ref: any;

  const onSendFriendReq = (userId: number, userName: string) => {
    api
      .post(routes.sendFriendReq, { user_id: userId })
      .then(() => {
        notifySuccess(`friend request sent to ${userName}`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  onMount(() => {
    autoAnimate(ref);
  });

  return (
    <>
      <header class="flex px-3 h-hh items-center relative z-20 w-full bg-skin-header-background justify-between">
        <div class="flex sm:w-full lg:w-fit md:w-fit items-center gap-5">
          <Link href="/">
            <img class="w-9 rounded-xl mr-2 h-8" src={logo} alt="logo" />
          </Link>
          <span class="flex items-center  rounded-md bg-inherit text-slate-300 h-8 border shadow-md p-1 border-header-menu">
            <BiSearchAlt2 size={22} />
            <input
              value={keyword()}
              onInput={(e) => setKeyword(e.currentTarget.value)}
              placeholder="search user"
              class="p-1 bg-inherit focus:outline-none"
              autocomplete="off"
            />
          </span>
          <FriendRequests />
          <GameInviteNotif />
        </div>
        <div class="flex">
          <ul class="p-1 lg:flex md:flex hidden w-64 items-center gap-5">
            <For each={LINKS}>
              {(link) => (
                <li class="text-white first-letter:capitalize">
                  <Link href={`/${link}`}>{link}</Link>
                </li>
              )}
            </For>
          </ul>
          <Link
            href="/chat"
            class="lg:hidden my-auto bg-transparent md:hidden block xl:hidden"
          >
            <IoChatbubblesSharp
              class="shadow-md bg-transparent"
              size={20}
              color="#001a4d"
            />
          </Link>
          <div ref={ref} class="relative">
            <button onClick={() => setIsOpen(!isOpen())}>
              <Avatar
                color="bg-green-400"
                imgUrl={
                  auth.user.avatarId
                    ? `${generateImageUrl(auth.user.avatarId)}`
                    : undefined
                }
              />
            </button>
            <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
              <div class="bg-skin-menu-background rounded-md w-60 absolute border-header-menu -right-4 border shadow-sm p-2 -top-1">
                <HeaderProfileMenu user={auth.user} />
              </div>
            </Modal>
          </div>
        </div>
        <Show when={keyword()}>
          <div class="absolute top-10 z-10 ml-16">
            <For
              each={users()
                ?.slice(0)
                ?.filter((user) =>
                  user.display_name
                    .toLocaleLowerCase()
                    .includes(keyword().toLocaleLowerCase()),
                )
                .slice(0, 10)}
            >
              {(user) => (
                <div class="w-60">
                  <SearchUserCard
                    onClick={() => {
                      onSendFriendReq(user.id, user.display_name);
                      setKeyword('');
                    }}
                    user={user}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </header>
    </>
  );
};

export default Header;
