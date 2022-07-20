import {
  Component,
  createEffect,
  createResource,
  createSignal,
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
import { unwrap } from 'solid-js/store';

const App: Component = () => {
  const [state, { loadPendingFriendReq }] = useStore();
  const [appLoaded, setAppLaoded] = createSignal(false);

  const navigate = useNavigate();

  if (state.token) setAppLaoded(true);
  onMount(() => {
    if (loadPendingFriendReq) {
      loadPendingFriendReq();
    }
  });

  createEffect(() => {
    if (!state.token) {
      navigate('/login');
    }
  });

  return (
    <div>
      <Show when={state.token}>
        <Header />
      </Show>
      <div class="container h-90">
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
    </div>
  );
};

export default App;
