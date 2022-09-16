import { Component, createEffect, createResource, Show } from 'solid-js';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Matchmaking from './pages/Matchmaking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useStore } from './store/StoreProvider';
import EditProfile from './pages/EditProfile';
import TwoFactorAuth from './pages/TwoFactorAuth';
import LeaderBoard from './pages/LeaderBoard';
import { Toaster } from 'solid-toast';
import { useAuth } from './Providers/AuthProvider';
import Protected from './components/Protected';
import Layout from './components/Layout';
import { useSockets } from './Providers/SocketProvider';
import { WsNotificationEvent } from './types/chat.interface';
import { api } from './utils/api';
import { User } from './types/user.interface';
import { routes } from './api/utils';

const App: Component = () => {
  const [
    state,
    {
      setOnlineUsers,
      setFriendInvitation,
      setInGameUsers,
      setUsersGameSessionIds,
      addOnlineUser,
      removeDisconnectedUser,
      addPendingFriendReq,
      setPendigFriendReq,
    },
  ] = useStore();
  const navigate = useNavigate();
  const [auth] = useAuth();

  const [sockets, { connectPongWs, connectNotificationWs, send }] =
    useSockets();

  const [pendingFriendReq] = createResource(
    () => auth.isAuth,
    async () => {
      const res = await api.get<{ req_user: User; status: number }[]>(
        routes.receivedFriendReq,
      );
      return res.data;
    },
  );

  const getNotif = () => {
    if (
      sockets.notificationWs &&
      sockets.notificationWs.readyState === WebSocket.OPEN
    ) {
      sockets.notificationWs.send(
        JSON.stringify({ event: 'isOnline', data: { sender: auth.user.id } }),
      );
      sockets.notificationWs.send(
        JSON.stringify({ event: 'isInGame', data: { sender: auth.user.id } }),
      );
    }
  };

  const location = useLocation();

  createEffect(() => {
    location;
    sockets.notificationState;
    if (
      sockets.notificationWs &&
      sockets.notificationState === WebSocket.OPEN
    ) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: {
          event: WsNotificationEvent;
          data: any;
          user_id?: number;
          friend_request: {
            requesting_user: User;
          };
        };
        res = JSON.parse(e.data);
        switch (res.event) {
          case 'pong: invitation':
            setFriendInvitation(res);
            break;
          case 'pong: invitation_accepted':
            navigate('/pong');
            break;
          case 'isOnline':
            setOnlineUsers(res.data);
            break;
          case 'isInGame':
            setUsersGameSessionIds(res.data.usersSessionIds);
            setInGameUsers(res.data.inGame);
            break;
          case 'pong: session_over':
            getNotif();
            break;
          case 'pong: new_session':
            getNotif();
            break;
          case 'users: new_user':
            addOnlineUser(res.user_id!);
            break;
          case 'status: friend_online':
            addOnlineUser(res.user_id!);
            break;
          case 'status: friend_offline':
            removeDisconnectedUser(res.user_id!);
            break;
          case 'group: online':
            addOnlineUser(res.data.user_id);
            break;
          case 'group: offline':
            removeDisconnectedUser(res.data.user_id);
            break;
          case 'friends: new_request':
            addPendingFriendReq({
              req_user: res.friend_request.requesting_user,
              status: 0,
            });
            break;
          default:
            break;
        }
      });
    }
  });

  createEffect(() => {
    if (pendingFriendReq()) {
      setPendigFriendReq(pendingFriendReq()!);
    }
  });

  createEffect(() => {
    if (
      sockets.notificationWs &&
      sockets.notificationState === WebSocket.OPEN
    ) {
      sockets.notificationWs.send(
        JSON.stringify({ event: 'isOnline', data: { sender: auth.user.id } }),
      );
      sockets.notificationWs.send(
        JSON.stringify({ event: 'isInGame', data: { sender: auth.user.id } }),
      );
    }
  });

  createEffect(() => {
    if (auth.isAuth) {
      connectPongWs();
      connectNotificationWs();
    }
  });

  const inGame = () => state.inGameUsers.includes(auth.user.id);
  return (
    <>
      <div class="w-full overflow-hidden">
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
              <Route
                path="/leaderboard"
                element={
                  <LeaderBoard style={{ height: '75vh' }} title="Leaderboard" />
                }
              />
            </Route>
          </Route>
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<p>Not found</p>} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
