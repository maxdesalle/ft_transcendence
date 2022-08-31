import { Component } from 'solid-js';

const BanModalContent: Component = () => {
  return (
    <div class="max-w-md h-10 p-4 max-h-96 bg-violet-800 flex flex-col">
      <label for="ban">How long</label>
      <input
        class="bg-skin-header-background"
        type="number"
        name="ban_time"
        id="ban"
      />
    </div>
  );
};

export default BanModalContent;
