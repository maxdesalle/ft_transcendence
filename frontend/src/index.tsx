/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from 'solid-app-router';
import './index.css';
import App from './App';
import { StoreProvider } from './store/index';
import { TurboContext } from 'turbo-solid';
import { api } from './utils/api';
import { AuthProvider } from './Providers/AuthProvider';
import Cookies from 'js-cookie';

const configuration = {
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
    <AuthProvider>
      <TurboContext.Provider value={configuration}>
        <Router>
          <StoreProvider>
            <App />
          </StoreProvider>
        </Router>
      </TurboContext.Provider>
    </AuthProvider>
  ),
  document.getElementById('root') as HTMLElement,
);
