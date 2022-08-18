import Cookies from 'js-cookie';
import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { User } from '../types/user.interface';

export interface AuthContextType {
  user: User;
  isAuth: boolean;
  token: string | undefined;
}

const AuthContext = createContext<any>();

export const AuthProvider = (props: any) => {
  const [state, setState] = createStore<AuthContextType>({
    user: {
      id: 0,
      avatarId: 0,
      display_name: '',
      login42: '',
      isTwoFactorAuthenticationEnabled: false,
    },
    token: Cookies.get('jwt_token'),
    isAuth: false,
  });

  const actions = {
    setUser(user: User) {
      setState('user', () => ({ ...user }));
    },
    setUserAvatarId(id: number) {
      setState('user', 'avatarId', id);
    },
    setToken(token: string | undefined) {
      setState('token', token);
    },
    setIsAuth(isAuth: boolean) {
      setState('isAuth', isAuth);
    },
  };

  const store = [state, actions];
  return (
    <AuthContext.Provider value={store}>{props.children}</AuthContext.Provider>
  );
};

export function useAuth(): [
  AuthContextType,
  {
    setUser: (user: User) => void;
    setToken: (token: string | undefined) => void;
    setIsAuth: (isAuth: boolean) => void;
    setUserAvatarId: (id: number) => void;
  },
] {
  return useContext(AuthContext);
}
