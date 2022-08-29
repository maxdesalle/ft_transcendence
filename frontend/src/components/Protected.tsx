import Cookies from 'js-cookie';
import { Outlet, useLocation, useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createResource,
  JSXElement,
  Show,
} from 'solid-js';
import { routes } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { User } from '../types/user.interface';
import { api } from '../utils/api';
import Loader from './Loader';

const Protected: Component<{ children: JSXElement }> = (props) => {
  const [state, { setUser, setToken, setIsAuth }] = useAuth();
  const [data] = createResource(
    () => Cookies.get('jwt_token'),
    async () => {
      try {
        const res = await api.get<User>(routes.currentUser);
        setIsAuth(true);
        setUser({ ...res.data });
        setToken(Cookies.get('jwt_token'));
        return res.data;
      } catch (error) {
        setIsAuth(false);
      }
    },
  );

  const navigate = useNavigate();
  const location = useLocation();
  createEffect(() => {
    if (!data.loading && !state.isAuth) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  });

  return (
    <Show when={!data.loading && state.isAuth} fallback={<Loader />}>
      {props.children}
      <Outlet />
    </Show>
  );
};

export default Protected;
