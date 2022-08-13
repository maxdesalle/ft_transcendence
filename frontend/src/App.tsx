import {
  Component,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { Route, Routes, useNavigate } from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Matchmaking from './pages/Matchmaking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useStore } from './store/index';
import EditProfile from './pages/EditProfile';
import TwoFactorAuth from './pages/TwoFactorAuth';
import { Message, WsNotificationEvent } from './types/chat.interface';
import LeaderBoard from './pages/LeaderBoard';
import { Toaster } from 'solid-toast';
import { User } from './types/user.interface';
import { routes } from './api/utils';
import { api } from './utils/api';
import { useAuth } from './Providers/AuthProvider';
import Protected from './components/Protected';
import Layout from './components/Layout';

const App: Component = () => {
  const [state, { setFriendInvitation, setFriendReqCount }] = useStore();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const token = () => auth.token;
  const [me, setMe] = createSignal<User>({
    display_name: '',
    avatarId: 0,
    isTwoFactorAuthenticationEnabled: false,
    login42: '',
    id: 0,
  });

  const [pendingFriendReq] = createResource(token, async () => {
    const res = await api.get<{ req_user: User; status: number }[]>(
      routes.receivedFriendReq,
    );
    return res.data;
  });

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
          // navigate('/login');
          break;
        case 'users: new_user':
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
    if (pendingFriendReq()) {
      setFriendReqCount(pendingFriendReq()!.length);
    }
  });
  onCleanup(() => {
    state.ws.close();
    state.pong.ws.close();
  });

  return (
    <>
      <div class="h-90 bg-skin-page">
        <Routes>
          <Route
            path=""
            element={
              <Protected>
                <Header />
              </Protected>
            }
          >
            <Route path="" element={<Layout />}>
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/pong" element={<Pong />} />
              <Route path="/viewer" element={<Viewer />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/edit_profile" element={<EditProfile />} />
              <Route path="/2fa" element={<TwoFactorAuth />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
