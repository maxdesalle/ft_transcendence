import Cookies from 'js-cookie';
import { useNavigate } from 'solid-app-router';
import { Component, createSignal } from 'solid-js';
import { urls } from '../api/utils';
import { useStore } from '../store/all';
import { api } from '../utils/api';

const TwoFactorAuth: Component = () => {
  const [code, setCode] = createSignal('');
  const navigate = useNavigate();
  const [_, { setToken }] = useStore();
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
        console.log(token);
        setToken(token);
        navigate('/');
      });
  };

  return (
    <div class="m-auto w-full h-full">
      <input
        type="number"
        onInput={(e) => setCode(e.currentTarget.value)}
        name="code"
        id="code"
        placeholder="enter code"
      />
      <button class="btn-primary" onClick={onSendCode}>
        Confirm
      </button>
    </div>
  );
};

export default TwoFactorAuth;
