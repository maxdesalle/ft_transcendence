import Cookies from 'js-cookie';
import { useNavigate } from 'solid-app-router';
import {
  Component,
  createSignal,
  onMount,
  Show,
} from 'solid-js';
import toast from 'solid-toast';
import { loginFromMockApi } from '../api/mock';
import { routes } from '../api/utils';
import Loader from '../components/Loader';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store';

const Login: Component = () => {
  const [username, setUsername] = createSignal<string>('');
  const navigate = useNavigate();
  const [state, { setToken }] = useStore();
  const [auth, { setToken: setAuthToken, setIsAuth, setUser }] = useAuth();
  const notify = (msg: string) => toast.error(msg);
  const [loading, setLoading] = createSignal(false);

  const onLogin = () => {
    if (!username().length) return;
    setLoading(true);
    loginFromMockApi(username())
      .then((res) => {
        const token = Cookies.get('jwt_token');
        if (token) {
          setToken(token);
          setAuthToken(token);
          setIsAuth(true);
          setUser(res.data);
          navigate('/matchmaking');
        }
        setLoading(false);
      })
      .catch((err) => {
        notify(err.message);
        setLoading(false);
      });
    setUsername('');
  };

  onMount(() => {
    if (auth.token) navigate('/matchmaking');
  });

  return (
    <Show when={!loading()} fallback={<Loader />}>
      <div class="flex flex-col items-center h-screen">
        <div class="max-w-md">
          <div class="flex flex-col border-2 p-2 mt-16 h-full">
            <label class="text-center" for="username">
              Username
            </label>
            <input
              autocomplete="off"
              onInput={(e) => setUsername(e.currentTarget.value)}
              name="username"
              placeholder="username"
              class="p-1 border-b border-blue-600 focus:border-blue-800 focus:outline-none"
              value={username()}
              type="text"
              id="username"
            />
            <button
              onClick={onLogin}
              class="bg-red-600 border text-white p-1 mt-1 rounded-md"
            >
              Login using Mock api
            </button>
            <button
              onClick={() => (window.location.href = routes.login42)}
              class="bg-blue-600 border text-white p-1 mt-1 rounded-md"
            >
              Login using 42
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Login;
