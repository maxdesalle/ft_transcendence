import { Component, createEffect, Show } from 'solid-js';
import { User } from '../types/user.interface';
import Avatar from './Avatar';
import leaderboardLogo from '../assets/podium.png';
import userProfileLogo from '../assets/user.png';
import settingsLogo from '../assets/settings.png';
import logOutLogo from '../assets/log-out.png';
import { Link, useNavigate } from 'solid-app-router';
import { urls } from '../api/utils';
import { forget } from 'turbo-solid';
import Cookies from 'js-cookie';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { generateImageUrl } from '../utils/helpers';
import defaultAvatar from '../../../backend/images/avatardefault.png';

const HeaderProfileMenu: Component<{ user: User }> = (props) => {
  const navigate = useNavigate();
  const [auth, { setToken, setIsAuth }] = useAuth();
  const [, { disconnect }] = useSockets();
  const [, { resetStore }] = useStore();
  const onLogout = () => {
    setToken(undefined);
    Cookies.remove('jwt_token', { sameSite: 'none', secure: true });
    forget();
    resetStore();
    disconnect();
    setIsAuth(false);
    navigate('/login');
  };

  return (
    <Show when={props.user}>
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-sm btn-ghost btn-circle avatar">
          <img
            src={
              auth.user.avatarId
                ? generateImageUrl(auth.user.avatarId)
                : defaultAvatar
            }
            alt="avatar"
          />
        </label>

        <ul
          tabindex="0"
          class="mt-3 font-semibold p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
        >
          <div class="flex items-center flex-col gap-1">
            <Avatar
              imgUrl={
                auth.user.avatarId
                  ? `${urls.backendUrl}/database-files/${auth.user.avatarId}`
                  : undefined
              }
            />
            <h3 class="font-bold">{props.user.display_name}</h3>
            <p class="text-slate-500 font-light">{props.user.login42}</p>
          </div>
          <li>
            <Link class="flex items-center" href="/leaderboard">
              <img
                src={leaderboardLogo}
                alt="leaderboard logo"
                class="w-5 h-5"
              />
              <p class="pl-2">Leaderboard</p>
            </Link>
          </li>
          <li>
            <Link class="" href={`profile/${props.user.id}`}>
              <img
                src={userProfileLogo}
                alt="user profile logo"
                class="w-5 h-5"
              />
              <p class="pl-2">View Profile</p>
            </Link>
          </li>
          <li>
            <Link class="" href="/edit_profile">
              <img src={settingsLogo} alt="setting logo" class="w-5 h-5" />
              <p class="pl-2">Edit Profile</p>
            </Link>
          </li>
          <li>
            <button class="" onClick={onLogout}>
              <img src={logOutLogo} alt="log out logo" />
              <p class="pl-2">Log out</p>
            </button>
          </li>
        </ul>
      </div>
    </Show>
  );
};

export default HeaderProfileMenu;
