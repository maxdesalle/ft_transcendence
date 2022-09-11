import Scrollbars from 'solid-custom-scrollbars';
import { Component, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { useAuth } from '../Providers/AuthProvider';
import { RoomInfo } from '../types/chat.interface';
import JoinableRoomList from './JoinableRoomList';

const ChatHome: Component = () => {
  const [auth] = useAuth();

  const [publicRooms, { refetch: refetchPublicRooms }] = createTurboResource<
    RoomInfo[]
  >(() => routes.publicRooms);
  const [, { refetch: refetchRooms }] = createTurboResource<RoomInfo[]>(
    () => routes.getRooms,
  );

  const joinableRooms = () =>
    publicRooms()?.filter((rooms) => {
      const b = rooms.users.find((user) => user.id === auth.user.id);
      if (b) return false;
      return true;
    });
  return (
    <Show when={joinableRooms()}>
      <h1 class=" text-center text-2xl font-semibold py-2">Public Rooms</h1>
      <Scrollbars>
        <JoinableRoomList
          keyword=""
          refetch={() => {
            refetchPublicRooms();
            refetchRooms();
          }}
          rooms={joinableRooms()!}
        />
      </Scrollbars>
    </Show>
  );
};

export default ChatHome;
