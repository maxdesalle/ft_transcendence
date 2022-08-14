import { AxiosError } from 'axios';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { Component, createSignal } from 'solid-js';
import { chatApi } from '../api/chat';
import { useAuth } from '../Providers/AuthProvider';
import { RoomInfo } from '../types/chat.interface';
import { notifyError, notifySuccess } from '../utils/helpers';
import Modal from './Modal';

const JoinableRoomCard: Component<{ room: RoomInfo; refetch: () => void }> = (
  props,
) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [password, setPassword] = createSignal('');

  const onSubmitPassword = () => {
    chatApi
      .joinGroup({ room_id: props.room.room_id, password: password() })
      .then(() => {
        props.refetch();
        notifySuccess(`you have joined ${props.room.room_name}`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };
  return (
    <div class="flex p-2 items-center">
      <HiSolidUserGroup color="#2564eb" size={24} />
      <div class="pl-2 justify-between items-center flex w-full text-white hover:text-slate-400 transition-all">
        <p class="font-bold first-letter:capitalize">{props.room.room_name}</p>
        <div>
          <button
            onClick={() => setIsOpen(true)}
            class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
          >
            Join
          </button>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <div class="flex flex-col bg-skin-header-background absolute p-2 rounded-md">
              <label for="password">Enter password</label>
              <input
                onInput={(e) => setPassword(e.currentTarget.value)}
                class="bg-skin-menu-background"
                type="password"
                name="password"
                id="password"
              />
              <div class="flex items-center mt-3 justify-between w-full">
                <button
                  class="text-white w-fit bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
                <button
                  onClick={onSubmitPassword}
                  class="text-white w-fit bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default JoinableRoomCard;
