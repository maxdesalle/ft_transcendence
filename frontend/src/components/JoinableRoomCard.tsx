import { AxiosError } from 'axios';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { Component, createSignal, Show } from 'solid-js';
import { chatApi } from '../api/chat';
import { RoomInfo } from '../types/chat.interface';
import { notifyError, notifySuccess } from '../utils/helpers';
import Modal from './Modal';

const JoinableRoomCard: Component<{ room: RoomInfo; refetch: () => void }> = (
  props,
) => {
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
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="flex p-2 items-center transition-all hover:bg-base-300">
      <HiSolidUserGroup class="text-primary-300" size={24} />
      <div class="pl-2 justify-between items-center flex w-full transition-all">
        <div>
          <p class="font-bold">{props.room.room_name}</p>
          <Show when={props.room.password_protected}>
            <p class="text-warning">Protected</p>
          </Show>
        </div>
        <div>
          <button
            onClick={() => setIsOpen(true)}
            class="btn-primary btn-sm btn"
          >
            Join
          </button>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <div class="flex p-2 right-0 absolute bg-base-300 rounded-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitPassword();
                }}
                class="flex flex-col"
              >
                <input
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  class="input"
                  placeholder="Enter room password"
                  type="password"
                  name="password"
                  id="password"
                  required={props.room.password_protected}
                />
                <div class="flex items-center mt-3 justify-between w-full">
                  <button class="btn-primary btn btn-sm w-full">Submit</button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default JoinableRoomCard;
