import { createStore } from 'solid-js/store';

const [store, setStore] = createStore<{
  onlineUsers: number[];
  inGameUsers: number[];
}>({
  onlineUsers: [],
  inGameUsers: [],
});

const actions = {
  setOnlineUsers(ids: number[]) {
    setStore('onlineUsers', ids);
  },
  setInGameUsers(ids: number[]) {
    setStore('inGameUsers', ids);
  },
  updateOnlineUsers(id: number) {
    setStore('onlineUsers', (e) => [...e, id]);
  },
  updateInGameUsers(id: number) {
    setStore('inGameUsers', (e) => [...e, id]);
  },
};

export { store, actions };
