import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { Route, Routes, useLocation, useNavigate } from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Matchmaking from './pages/Matchmaking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { StoreProvider, useStore } from './store/index';
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
import Cookies from 'js-cookie';
import { useSockets } from './Providers/SocketProvider';

const App: Component = () => {
  const [_, { setFriendReqCount, setFriendInvitation }] = useStore();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const token = () => auth.token;

  const [sockets, { connectPongWs, connectNotificationWs }] = useSockets();

  const [pendingFriendReq] = createResource(token, async () => {
    const res = await api.get<{ req_user: User; status: number }[]>(
      routes.receivedFriendReq,
    );
    return res.data;
  });

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent };
        res = JSON.parse(e.data);
        if (res.event === 'pong: invitation') {
          setFriendInvitation(res);
        } else if (res.event === 'pong: invitation_accepted') {
          navigate('/pong');
        }
      });
    }
  });

  createEffect(() => {
    if (pendingFriendReq()) {
      setFriendReqCount(pendingFriendReq()!.length);
    }
  });

  createEffect(() => {
    if (auth.isAuth) {
      connectPongWs();
      connectNotificationWs();
    }
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
              <Route path="/" element={<Matchmaking />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/pong" element={<Pong />} />
              <Route path="/viewer/:id" element={<Viewer />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/edit_profile" element={<EditProfile />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />
            </Route>
          </Route>
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
