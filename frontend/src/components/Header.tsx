import { Link, useNavigate } from 'solid-app-router';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import logo from '../assets/logo.png';
import { BiSearchAlt2 } from 'solid-icons/bi';
import HeaderProfileMenu from './HeaderProfileMenu';
import Modal from './Modal';
import Avatar from './Avatar';
import { useStore } from '../store/index';
import SearchUserCard from './SearchUserCard';
import { generateImageUrl } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import { api } from '../utils/api';
import toast from 'solid-toast';
import autoAnimate from '@formkit/auto-animate';
import { IoNotificationsSharp } from 'solid-icons/io';
import PendingFriendReqCard from './PendingFriendReqCard';
import { AxiosError } from 'axios';
const LINKS = ['chat', 'leaderboard', 'viewer', 'pong'];

const Header: Component = () => {
  const [keyword, setKeyword] = createSignal<string>('');
  const [state, { setFriendInvitation }] = useStore();
  const [users] = createTurboResource<User[]>(() => routes.users);
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const navigate = useNavigate();
  const notifySuccess = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const [isOpen, setIsOpen] = createSignal(false);
  const [isNotifOpen, setIsNotifOpen] = createSignal(false);
  const [uRef, setUref] = createSignal<any>();
  let ref: any;
  let notifRef: any;

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

  const onAcceptInvite = () => {
    const data = {
      event: 'accept',
      data: state.pong.friendInvitation?.user_id,
    };
    state.pong.ws.send(JSON.stringify(data));
    navigate('/pong');
    setFriendInvitation(null);
  };

  onMount(() => {
    autoAnimate(ref);
    autoAnimate(notifRef);
    autoAnimate(uRef());
  });

  return (
    <>
      <header class="flex items-center relative z-20 bg-skin-header-background py-1 px-6 justify-between">
        <div class="flex items-center">
          <Link href="/matchmaking">
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
        <ul class="flex p-1 justify-between w-64 items-center">
          <For each={LINKS}>
            {(link) => (
              <li class="text-white first-letter:capitalize">
                <Link href={`/${link}`}>{link}</Link>
              </li>
            )}
          </For>
          <li
            class="items-center justify-center px-2 py-1 text-xs leading-none text-red-100 bg-blue-600 rounded-full"
            ref={notifRef}
          >
            <button
              class="flex items-center text-black"
              onClick={() => setIsNotifOpen(!isNotifOpen())}
            >
              <IoNotificationsSharp color="#000" />
              <span class="text-sm">
                {state.currentUser.friendReqCount < 2
                  ? state.currentUser.friendReqCount
                  : `${state.currentUser.friendReqCount}+`}
              </span>
            </button>
            <Modal isOpen={isNotifOpen()} toggleModal={setIsNotifOpen}>
              <PendingFriendReqCard />
            </Modal>
          </li>
          <Show when={state.pong.friendInvitation}>
            <li>
              <button onClick={onAcceptInvite} class="btn-primary">
                Accept
              </button>
            </li>
          </Show>
        </ul>
        <div ref={ref} class="relative">
          <button onClick={() => setIsOpen(!isOpen())}>
            <Avatar
              imgUrl={
                currentUser()?.avatarId
                  ? `${generateImageUrl(currentUser()!.avatarId)}`
                  : undefined
              }
            />
          </button>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <Show when={currentUser()}>
              <div class="bg-skin-menu-background w-60 absolute border-header-menu -right-4 border shadow-sm p-2 -top-1">
                <HeaderProfileMenu user={currentUser()!} />
              </div>
            </Show>
          </Modal>
        </div>
      </header>
      <div ref={setUref} class="relative">
        <Show when={keyword()}>
          <div class="absolute top-0 z-10 ml-16">
            <For
              each={users()
                ?.slice(0)
                ?.filter((user) =>
                  user.display_name
                    .toLocaleLowerCase()
                    .includes(keyword().toLocaleLowerCase()),
                )
                .slice(0, 15)}
            >
              {(user) => (
                <div class="w-60">
                  <SearchUserCard
                    onClick={() => {
                      onSendFriendReq(user.id, user.display_name);
                    }}
                    user={user}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </>
  );
};

export default Header;
