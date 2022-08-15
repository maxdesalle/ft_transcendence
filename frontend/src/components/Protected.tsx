import Cookies from 'js-cookie';
import { Navigate, Outlet } from 'solid-app-router';
import {
  Component,
  createResource,
  JSXElement,
  Show,
} from 'solid-js';
import { routes } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { User } from '../types/user.interface';
import { api } from '../utils/api';

const Protected: Component<{ children: JSXElement }> = (props) => {
  const [state, { setUser, setToken, setIsAuth }] = useAuth();
  const [_] = createResource(async () => {
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

  return (
    <Show when={state.token} fallback={<Navigate href="/login" />}>
      {props.children}
      <Outlet />
    </Show>
  );
};

export default Protected;
