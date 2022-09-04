import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'solid-app-router';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import toast from 'solid-toast';
import { loginFromMockApi } from '../api/mock';
import { routes } from '../api/utils';
import Loader from '../components/Loader';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store/all';

const Login: Component = () => {
  const [username, setUsername] = createSignal<string>('');
  const navigate = useNavigate();
  const [__, { setToken }] = useStore();
  const [auth, { setToken: setAuthToken, setIsAuth, setUser }] = useAuth();
  const notify = (msg: string) => toast.error(msg);
  const [loading, setLoading] = createSignal(false);
  const location = useLocation();

  const onLogin = () => {
    if (!username().length) return;
    setLoading(true);
    loginFromMockApi(username())
      .then((res) => {
        const token = Cookies.get('jwt_token');
        if (token) {
          setToken(token);
          setAuthToken(token);
          if (!res.data.isTwoFactorAuthenticationEnabled) {
            setIsAuth(true);
            navigate(location.state?.from || '/', { replace: true });
          } else {
            setUser(res.data);
            setLoading(false);
            navigate('/2fa');
          }
        }
      })
      .catch((err) => {
        notify(err.message);
        setLoading(false);
      });
    setUsername('');
  };

  return (
    <div class="flex flex-col items-center h-screen">
      <div class="max-w-md">
        <div class="flex flex-col border-2 gap-2 p-2 mt-32 h-fit rounded border-base-300">
          <label class="text-center" for="username">
            Username
          </label>
          <input
            autocomplete="off"
            onInput={(e) => setUsername(e.currentTarget.value)}
            name="username"
            placeholder="username"
            class="input input-bordered"
            value={username()}
            type="text"
            id="username"
          />
          <Show when={!loading()} fallback={<Loader />}>
            <button onClick={onLogin} class="btn btn-error">
              Login using Mock api
            </button>
          </Show>
          <button
            onClick={() => (window.location.href = routes.login42)}
            class="btn-primary btn"
          >
            Login using 42
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
