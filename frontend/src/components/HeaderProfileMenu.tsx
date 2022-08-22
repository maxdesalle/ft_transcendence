import { Component, createEffect, Show } from 'solid-js';
import { User } from '../types/user.interface';
import Avatar from './Avatar';
import leaderboardLogo from '../assets/podium.png';
import userProfileLogo from '../assets/user.png';
import settingsLogo from '../assets/settings.png';
import matchHistoryLogo from '../assets/pong.png';
import logOutLogo from '../assets/log-out.png';
import { Link, useNavigate } from 'solid-app-router';
import { routes, urls } from '../api/utils';
import { createTurboResource, forget } from 'turbo-solid';
import Cookies from 'js-cookie';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';

const HeaderProfileMenu: Component<{ user: User }> = (props) => {
  const navigate = useNavigate();
  const [auth, { setToken, setIsAuth }] = useAuth();
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [__, { disconnect }] = useSockets();
  const [___, { resetStore }] = useStore();
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
      <div class="flex flex-col items-center py-3">
        <Avatar
          imgUrl={
            auth.user.avatarId
              ? `${urls.backendUrl}/database-files/${auth.user.avatarId}`
              : undefined
          }
        />
        <h3 class="text-slate-100 font-light">{props.user.display_name}</h3>
        <p class="text-slate-500 font-light">{props.user.login42}</p>
      </div>
      <ul class="pl-3 text-white">
        <li class="py-2 flex items-center">
          <Link class="py-2 flex items-center" href="/leaderboard">
            <img src={leaderboardLogo} alt="leaderboard logo" class="w-5 h-5" />
            <p class="pl-2">Leaderboard</p>
          </Link>
        </li>
        <li>
          <Link
            class="py-2 flex items-center"
            href={`profile/${props.user.id}`}
          >
            <img
              src={userProfileLogo}
              alt="user profile logo"
              class="w-5 h-5"
            />
            <p class="pl-2">View Profile</p>
          </Link>
        </li>
        <li>
          <Link class="py-2 flex items-center" href="/edit_profile">
            <img src={settingsLogo} alt="setting logo" class="w-5 h-5" />
            <p class="pl-2">Edit Profile</p>
          </Link>
        </li>
        <li class="py-2 flex items-center">
          <img
            src={matchHistoryLogo}
            alt="match history logo"
            class="w-5 h-5"
          />
          <p class="pl-2">Match History</p>
        </li>
        <li class="py-2">
          <button class="flex items-center" onClick={onLogout}>
            <img src={logOutLogo} alt="log out logo" />
            <p class="pl-2">Log out</p>
          </button>
        </li>
      </ul>
    </Show>
  );
};

export default HeaderProfileMenu;
