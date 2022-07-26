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

const App: Component = () => {
  const [
    state,
    {
      loadPendingFriendReq,
      mutateFriendMsgs,
      mutateRoomMsgs,
      addPendingFriendReq,
      refetchFriends,
    },
  ] = useStore();
  const navigate = useNavigate();

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
          // if it's a fresh user might not find him in users and also might be null
          const pendigUser = state.users?.find(
            (user) => user.id == res.friend_request?.requesting_user?.id,
          );
          if (pendigUser) {
            addPendingFriendReq({
              user: pendigUser,
              status: res.friend_request!.status,
            });
          }
          break;
        case 'friends: request_accepted':
          console.log(res);
          if (refetchFriends) refetchFriends();
          break;
        case 'friends: request_rejected':
          console.log(res);
          break;
        case 'status: friend_offline':
          console.log(res);
          break;
        case 'status: friend_online':
          const friend = state.currentUser.friends.find(
            (friend) => friend.id === res.user_id,
          );
          if (friend) {
            console.log('friend online: ', friend);
          }
          break;
        case 'status: friend_online':
          console.log(res);
          break;
        default:
          console.log('default: ', res);
          break;
      }
      // if (res.event === 'chat_room_msg') {
      //   if (mutateRoomMsgs) {
      //     mutateRoomMsgs(res.message as Message);
      //   }
      // } else if (res.event == 'chat_dm') {
      //   if (mutateFriendMsgs) {
      //     mutateFriendMsgs(res.message as Message);
      //   }
      // }
    });
    state.ws.addEventListener('open', (e) => {});
    state.ws.addEventListener('close', (e) => {});
    if (loadPendingFriendReq) {
      loadPendingFriendReq();
    }
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

  return (
    <>
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
    </>
  );
};

export default App;
