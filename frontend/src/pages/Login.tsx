import { useNavigate } from 'solid-app-router';
import { Component, createRenderEffect, createSignal } from 'solid-js';
import { loginFromMockApi } from '../api/mock';
import { routes } from '../api/utils';

function model(el: any, accessor: any) {
  const [s, set] = accessor();
  el.addEventListener('input', (e: any) => set(e.currentTarget.value));
  createRenderEffect(() => (el.value = s()));
}

const Login: Component = () => {
  const [username, setUsername] = createSignal<string>('');
  const navigate = useNavigate();

  const onLogin = () => {
    if (!username().length) return;
    loginFromMockApi(username());
    setUsername('');
    navigate('/');
  };

  return (
    <div class="flex flex-col items-center h-screen">
      <div class="max-w-md">
        <div class="flex flex-col border-2 p-2 mt-16 h-full">
          <label class="text-center" for="username">
            Username
          </label>
          <input
            autocomplete="off"
            //@ts-ignore
            use:model={[username, setUsername]}
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
  );
};

export default Login;
