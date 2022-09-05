import Cookies from 'js-cookie';
import { useNavigate } from 'solid-app-router';
import { Component, createSignal } from 'solid-js';
import Modal from './Modal';

const FirstLogin: Component = () => {
  const [isOpen, setIsOpen] = createSignal(!!Cookies.get('first_login'));

  const onCloseModal = () => {
    setIsOpen(false);
    Cookies.remove('first_login', { sameSite: 'none', secure: true });
  };
  const navigate = useNavigate();

  const onNavigate = () => {
    onCloseModal();
    navigate('edit_profile');
  };
  return (
    <>
      <Modal
        bgColor="bg-black opacity-60"
        class="w-full h-full"
        isOpen={isOpen()}
      >
        <div class="flex max-w-md flex-col gap-2 p-3 rounded bg-base-300 lg:left-1/4 md:left-1/4 md:right-1/4 lg:right-1/4 top-1/4 absolute">
          <h1 class="text-3xl text-center font-bold">Welcome to 19 pong</h1>
          <p class="text-center">
            You can edit your profile (change name, avatar and activate 2 factor
            authentication)
          </p>
          <p class="text-center text-lg font-semibold">Game controls</p>
          <div class="flex justify-center w-full">
            <kbd class="kbd">▲</kbd>
          </div>
          <div class="flex justify-center w-full">
            <kbd class="kbd">▼</kbd>
          </div>
          <div class="flex gap-1 items-center self-center">
            <button onClick={onNavigate} class="btn btn-info btn-sm">
              Edit Profile
            </button>
            <button
              onClick={onCloseModal}
              class="w-fit btn btn-sm btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FirstLogin;
