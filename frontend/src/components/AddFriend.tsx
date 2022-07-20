import { Component } from 'solid-js';
import { useStore } from '../store';

const AddFriend: Component = () => {
  const [state, { sendFriendRequest }] = useStore();

  const onAddFriend = () => {
    if (sendFriendRequest) {
    }
  };
  return (
    <div class="flex flex-col">
      <input
        autocomplete="off"
        type="text"
        class="bg-white px-4 py-2 rounded border-b focus:outline-none border-b-blue-800 focus:text-blue-600"
        name=""
        id="room_id"
        placeholder="Enter username"
      />
      <button onClick={onAddFriend} class="btn-primary w-fit mt-2">
        Add friend
      </button>
    </div>
  );
};

export default AddFriend;
