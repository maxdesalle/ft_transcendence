import Cookies from 'js-cookie';
import { Navigate, Outlet, useLocation, useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  JSXElement,
  Show,
  Suspense,
} from 'solid-js';
import { routes } from '../api/utils';
import Login from '../pages/Login';
import { useAuth } from '../Providers/AuthProvider';
import { User } from '../types/user.interface';
import { api } from '../utils/api';

const Protected: Component<{ children: JSXElement }> = (props) => {
  const [state, { setUser, setToken, setIsAuth }] = useAuth();
  const [data] = createResource(async () => {
    try {
      const res = await api.get<User>(routes.currentUser);
      setIsAuth(true);
      setUser(res.data);
      setToken(Cookies.get('jwt_token'));
      return res.data;
    } catch (error) {
      setIsAuth(false);
    }
  });
  const navigate = useNavigate();
  createEffect(() => {
    if (!data.loading && state.isAuth) {
      navigate('/', { replace: true });
    }
  });
  return (
    <Show when={state.isAuth} fallback={<Login />}>
      {props.children}
      <Outlet />
    </Show>
  );
};

export default Protected;
