import {
  Component,
  createEffect,
  createResource,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js';
import { Route, Routes, useNavigate } from 'solid-app-router';
import Chat from './pages/Chat';
import Pong from './pages/Pong';
import Viewer from './pages/Viewer';
import Header from './components/Header';
import Matchmaking from './pages/Matchmaking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useStore } from './store/all';
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
      addOnlineUser,
      removeDisconnectedUser,
      addPendingFriendReq,
      setPendigFriendReq,
    },
  ] = useStore();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [sockets, { connectPongWs, connectNotificationWs, disconnect }] =
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

  createEffect(() => {
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.addEventListener('message', (e) => {
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
            console.log(res);
            setFriendInvitation(res);
            break;
          case 'pong: invitation_accepted':
            navigate('/pong');
            break;
          case 'isOnline':
            setOnlineUsers(res.data);
            break;
          case 'isInGame':
            setInGameUsers(res.data.inGame);
            break;
          case 'pong: session_over':
            sockets.notificationWs!.send(
              JSON.stringify({
                event: 'isInGame',
                data: { sender: auth.user.id },
              }),
            );
            break;
          case 'pong: new_session':
            sockets.notificationWs!.send(
              JSON.stringify({
                event: 'isInGame',
                data: { sender: auth.user.id },
              }),
            );
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
            console.log(res);
        }
      });
    }
  });

  createEffect(() => {
    if (pendingFriendReq()) {
      setPendigFriendReq(pendingFriendReq()!);
    }
  });

  onMount(() => {
    // console.log = () => {};
  });

  createEffect(() => {
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.send(
        JSON.stringify({
          event: 'isOnline',
          data: { sender: auth.user.id },
        }),
      );

      sockets.notificationWs!.send(
        JSON.stringify({
          event: 'isInGame',
          data: { sender: auth.user.id },
        }),
      );
    }
  });

  //--- pong socket reconnection
  let amount = 1;

  createEffect(() => {
    if (
      sockets.pongWs &&
      sockets.pongWsState === WebSocket.OPEN &&
      amount === 1
    ) {
      sockets.pongWs.close();
      amount--;
    }
  });
  //---

  createEffect(() => {
    if (auth.isAuth) {
      connectPongWs();
      connectNotificationWs();
    }
  });

  onCleanup(() => disconnect());

  return (
    <>
      <div class="bg-skin-page w-full overflow-hidden">
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
          <Route path="*" element={<p>Not found</p>} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
