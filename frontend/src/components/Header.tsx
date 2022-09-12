import { Link, useLocation } from 'solid-app-router';
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js';
import logo from '../assets/logo.png';
import { BiSearchAlt2 } from 'solid-icons/bi';
import HeaderProfileMenu from './HeaderProfileMenu';
import SearchUserCard from './SearchUserCard';
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
import { RiDesignPaintFill } from 'solid-icons/ri';
import { themeChange } from 'theme-change';
import { useStore } from '../store/StoreProvider';

const Header: Component = () => {
  const [keyword, setKeyword] = createSignal<string>('');
  const [users] = createTurboResource<User[]>(() => routes.users);
  const [auth] = useAuth();
  const [state] = useStore();
  const notifySuccess = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const [selectedTheme, setSelectedTheme] = createSignal('dark');
  let ref: any;
  const themes = [
    'night',
    'dark',
    'retro',
    'coffee',
    'dracula',
    'valentine',
    'halloween',
    'business',
    'synthwave',
  ];

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

  const inGame = () => state.inGameUsers.includes(auth.user.id);

  onMount(() => {
    autoAnimate(ref);
  });

  createEffect(() => {
    selectedTheme();
    themeChange(false);
  });
  const location = useLocation();

  return (
    <div class="bg-base-300">
      <header class="lg:container navbar bg-base-300">
        <div class="flex-1">
          <Link href="/">
            <img
              style={{
                'max-width': '36px',
              }}
              class="rounded-xl mr-2 h-8"
              src={logo}
              alt="logo"
            />
          </Link>
          <div class="form-control">
            <label class="input-group">
              <span class="hidden lg:block">
                <BiSearchAlt2 size={22} />
              </span>
              <input
                value={keyword()}
                onInput={(e) => setKeyword(e.currentTarget.value)}
                placeholder="search user"
                class="input input-bordered input-sm"
                autocomplete="off"
              />
            </label>
          </div>
          <FriendRequests />
          <GameInviteNotif />
        </div>
        <ul class="flex gap-2">
          <For each={LINKS}>
            {(link) => (
              <li class="first-letter:capitalize font-semibold hidden lg:block md:block">
                <Link href={`/${link}`}>{link}</Link>
              </li>
            )}
          </For>
          <Show when={inGame() && location.pathname !== '/pong'}>
            <li class="first-letter:capitalize font-semibold hidden lg:block md:block">
              <Link class="btn btn-sm btn-warning" href="/pong">
                Back to Pong
              </Link>
            </li>
          </Show>
          <li class="block lg:hidden">
            <Link href="/chat" class="my-auto bg-transparent md:hidden">
              <IoChatbubblesSharp
                class="shadow-md bg-transparent"
                size={20}
                color="#001a4d"
              />
            </Link>
          </li>
          <li>
            <div ref={ref} class="dropdown dropdown-end">
              <label class="flex items-center font-semibold" tabindex="0">
                <RiDesignPaintFill />
                Theme
              </label>
              <ul
                tabindex="0"
                class="dropdown-content menu-compact menu p-2 shadow bg-base-100 rounded w-fit"
              >
                <For each={themes}>
                  {(t) => (
                    <li
                      onClick={() => {
                        setSelectedTheme(t);
                      }}
                    >
                      <a>
                        <button class="capitalize" data-set-theme={t}>
                          {t}
                        </button>
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </li>
          <li>
            <HeaderProfileMenu user={auth.user} />
          </li>
        </ul>
        <Show when={keyword()}>
          <div class="absolute flex bg-base-300 flex-col rounded top-10 z-30 ml-16">
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
    </div>
  );
};

export default Header;
