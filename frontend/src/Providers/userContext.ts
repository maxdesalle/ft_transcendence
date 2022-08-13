import { Accessor, createContext, Setter, useContext } from 'solid-js';
import { User } from '../types/user.interface';

export interface UserContextType {
  user: User;
  setUser: Setter<User> | undefined;
}

export const UserContext = createContext<UserContextType>({
  user: {
    display_name: '',
    avatarId: 0,
    isTwoFactorAuthenticationEnabled: false,
    login42: '',
    id: 0,
  },
  setUser: undefined,
});

export const useUser = () => {
  return useContext(UserContext);
};
