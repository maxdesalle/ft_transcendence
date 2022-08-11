import { Component, createEffect, createResource, onCleanup, onMount, Show } from 'solid-js';
import { Route, Routes, useNavigate } from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Admin from './pages/Admin';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useStore } from './store/index';
import EditProfile from './pages/EditProfile';
import TwoFactorAuth from './pages/TwoFactorAuth';
import { Message, WsNotificationEvent } from './types/chat.interface';
import LeaderBoard from './pages/LeaderBoard';
import { api } from './utils/api';
import { Toaster } from 'solid-toast';
import { createTurboResource, mutate, TurboContext } from 'turbo-solid';
import { routes } from './api/utils';
import { User } from './types/user.interface';
import { fetchUsers } from './api/user';

const App: Component = () => {
  const [state, { mutateFriendMsgs, mutateRoomMsgs, setFriendInvitation }] =
    useStore();
  const navigate = useNavigate();
  const [users, { refetch }] = createResource<User[]>(fetchUsers);

  onMount(() => {
    state.ws.addEventListener('message', (e) => {
      let res: {
        event: WsNotificationEvent;
        message?: Message;
        user_id?: number;
        friend_request?: {
          req_user_id?: number;
          recv_user_id?: number;
          receiving_user?: { id: number };
          requesting_user?: { id: number };
          status: number;
        };
      };
      res = JSON.parse(e.data);
      switch (res.event) {
        case 'chat_room_msg':
          if (mutateRoomMsgs) {
            mutateRoomMsgs(res.message as Message);
          }
          break;
        case 'chat_dm':
          if (mutateFriendMsgs) {
            mutateFriendMsgs(res.message as Message);
          }
          break;
        case 'friends: new_request':
          console.log(`${res.event}: `, res);
          // if it's a fresh user might not find him in users and also might be null
          const reqUser = users()?.find(
            (user) => user.id === res.friend_request!.requesting_user!.id,
          );
          break;
        case 'friends: request_accepted':
          console.log(`${res.event}: `, res);
          break;
        case 'friends: request_rejected':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_offline':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_online':
          console.log(`${res.event}: `, res);
          break;
        case 'status: friend_online':
          console.log(`${res.event}: `, res);
          break;
        case 'pong: player_joined':
          navigate('/pong');
          break;
        case 'pong: invitation_accepted':
          navigate('/pong');
          break;
        case 'pong: invitation':
          setFriendInvitation(res);
          break;
        case 'ws_auth_fail':
          navigate('/login');
          break;
        case 'users: new_user':
          refetch();
          break;
        default:
          console.log(`${res.event}: `, res);
          break;
      }
    });
    state.ws.addEventListener('open', (e) => {});
    state.ws.addEventListener('close', (e) => {});
  });

  createEffect(() => {
    if (!state.token) {
      navigate('/login');
    }
  });

  onCleanup(() => {
    state.ws.close();
    state.pong.ws.close();
  });

  const configuration = {
    async fetcher(key: string) {
      const response = await api.get(key);
      return response.data;
    },
  };

  return (
    <TurboContext.Provider value={configuration}>
      <Show when={state.token}>
        <Header />
      </Show>
      <div class="container h-90 bg-skin-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
        </Routes>
      </div>
      <Toaster />
    </TurboContext.Provider>
  );
};

export default App;
