import { Component, createEffect } from 'solid-js';
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

const App: Component = () => {
  const [
    state,
    { setOnlineUsers, setFriendInvitation, setInGameUsers, addOnlineUser },
  ] = useStore();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [
    sockets,
    { connectPongWs, connectNotificationWs, setNotifState, setWsPongState },
  ] = useSockets();

  // const [pendingFriendReq] = createResource(token, async () => {
  //   const res = await api.get<{ req_user: User; status: number }[]>(
  //     routes.receivedFriendReq,
  //   );
  //   return res.data;
  // });

  createEffect(() => {
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; data: any };
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
            console.log(res.data.inGame);
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
          default:
            console.log(res);
        }
      });
    }
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

  createEffect(() => {
    // console.log(auth.isAuth);
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
          <Route path="*" element={<p>Not found</p>} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

export default App;
