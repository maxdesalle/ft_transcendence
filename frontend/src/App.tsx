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
import { Message } from './types/chat.interface';

const App: Component = () => {
  const [state, { loadPendingFriendReq, mutateFriendMsgs, mutateRoomMsgs }] =
    useStore();
  const navigate = useNavigate();

  onMount(() => {
    state.ws.addEventListener('message', (e) => {
      console.log('message', e);
      let res;
      res = JSON.parse(e.data);
      if (res.event === 'chat_room_msg') {
        if (mutateRoomMsgs) {
          mutateRoomMsgs(res.message as Message);
        }
      } else if (res.event == 'chat_dm') {
        if (mutateFriendMsgs) {
          mutateFriendMsgs(res.message as Message);
        }
      }
    });
    state.ws.addEventListener('open', (e) => {
      console.log('conection open: ', e);
    });
    state.ws.addEventListener('close', (e) => {
      console.log('closed', e);
    });
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
    console.log('cleaning up');
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
        </Routes>
      </div>
    </>
  );
};

export default App;
