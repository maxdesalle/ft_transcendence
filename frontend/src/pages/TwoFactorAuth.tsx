import Cookies from 'js-cookie';
import { useNavigate } from 'solid-app-router';
import { Component, createSignal } from 'solid-js';
import { urls } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store/all';
import { api } from '../utils/api';

const TwoFactorAuth: Component = () => {
  const [code, setCode] = createSignal('');
  const [auth, { setIsAuth, setToken }] = useAuth();
  const navigate = useNavigate();
  const onSendCode = () => {
    api
      .post<{ success: boolean }>(
        `${urls.backendUrl}/login/two-factor-authentication/`,
        {
          twoFactorAuthenticationCode: code(),
        },
      )
      .then(() => {
        const token = Cookies.get('jwt_token');
        if (token) {
          setIsAuth(true);
          setToken(token);
          navigate('/');
        }
      });
  };

  return (
    <div class="h-screen flex items-center justify-center">
      <div class="flex flex-col w-2/5 h-auto gap-3 items-center border border-base-100 p-2 justify-center">
        <label for="code" class="text-2xl font-semibold">
          Enter 2fa Code
        </label>
        <input
          type="number"
          class="input w-full"
          onInput={(e) => setCode(e.currentTarget.value)}
          name="code"
          id="code"
          placeholder="enter code"
        />
        <button class="btn-primary btn w-full" onClick={onSendCode}>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
