import { IoSend } from "solid-icons/io";
import { Component, Setter } from "solid-js";

const ChatForm: Component<{
  message: string;
  onSendMessage: () => void;
  setMessage: Setter<string>;
}> = (props) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (props.message) {
          props.onSendMessage();
        }
      }}
      class="p-1 z-10 flex items-center border shadow-md border-header-menu rounded-md mt-2"
    >
      <input
        type="text"
        autocomplete="off"
        id="message"
        value={props.message}
        onInput={(e) => props.setMessage(e.currentTarget.value)}
        class="w-full z-10 text-white  pl-4 py-1 focus:outline-none bg-skin-menu-background"
        placeholder="Enter a message"
      />
      <button onClick={props.onSendMessage} class="text-skin-gray pl-2">
        <IoSend size={22} />
      </button>
    </form>
  );
};

export default ChatForm;
