/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from 'solid-app-router';
import './index.css';
import App from './App';
import { StoreProvider } from './store/StoreProvider';
import { TurboContext, TurboSolidResourceOptions } from 'turbo-solid';
import { api } from './utils/api';
import { AuthProvider } from './Providers/AuthProvider';
import Cookies from 'js-cookie';
import { SocketProvider } from './Providers/SocketProvider';

const configuration: TurboSolidResourceOptions = {
  async fetcher(key: string) {
    const token = Cookies.get('jwt_token');
    const response = await api.get(key, {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  },
};
render(
  () => (
    <Router>
      <AuthProvider>
        <TurboContext.Provider value={configuration}>
          <SocketProvider>
            <StoreProvider>
              <App />
            </StoreProvider>
          </SocketProvider>
        </TurboContext.Provider>
      </AuthProvider>
    </Router>
  ),
  document.getElementById('root') as HTMLElement,
);
