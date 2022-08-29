import autoAnimate from '@formkit/auto-animate';
import { IoNotificationsSharp } from 'solid-icons/io';
import { Component, createSignal, onMount } from 'solid-js';
import { useStore } from '../store/all';
import Modal from './Modal';
import PendingFriendReqCard from './PendingFriendReqCard';

const FriendRequests: Component = () => {
  let ref: any;
  const [state] = useStore();
  const [isNotifOpen, setIsNotifOpen] = createSignal(false);

  onMount(() => {
    autoAnimate(ref);
  });

  return (
    <div
      class="items-center justify-center px-2 py-1 text-xs leading-none text-red-100 bg-skin-header-background rounded-full"
      ref={ref}
    >
      <button
        classList={{
          'animate-bounce': !!state.currentUser.pendingFriendReq.length,
        }}
        class="flex items-center text-black"
        onClick={() => setIsNotifOpen(!isNotifOpen())}
      >
        <IoNotificationsSharp size={20} color="#001a4d" />
        <span class="text-sm">
          {!state.currentUser.pendingFriendReq.length
            ? state.currentUser.pendingFriendReq.length
            : `${state.currentUser.pendingFriendReq.length}+`}
        </span>
      </button>
      <Modal isOpen={isNotifOpen()} toggleModal={setIsNotifOpen}>
        <PendingFriendReqCard />
      </Modal>
    </div>
  );
};

export default FriendRequests;
