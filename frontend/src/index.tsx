/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from 'solid-app-router';
import './index.css';
import App from './App';
import { StoreProvider } from './store/index';
import { TurboContext } from 'turbo-solid';
import { api } from './utils/api';

const configuration = {
  async fetcher(key: string) {
    const response = await api.get(key);
    return response.data;
  },
};
render(
  () => (
    <TurboContext.Provider value={configuration}>
      <Router>
        <StoreProvider>
          <App />
        </StoreProvider>
      </Router>
    </TurboContext.Provider>
  ),
  document.getElementById('root') as HTMLElement,
);
