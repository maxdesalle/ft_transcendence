import { IoSend } from 'solid-icons/io';
import { Component, Setter } from 'solid-js';

const ChatForm: Component<{
  message: string;
  onSendMessage: (message: string) => void;
  setMessage: Setter<string>;
}> = (props) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (props.message) {
          props.onSendMessage(props.message);
        }
      }}
      class="form-control mb-1 "
    >
      <label class="input-group">
        <input
          type="text"
          autocomplete="off"
          id="message"
          value={props.message}
          onInput={(e) => props.setMessage(e.currentTarget.value)}
          class="input w-full input-md input-bordered focus:outline-none"
          placeholder="Enter a message"
        />
        <span
          onClick={() => props.onSendMessage(props.message)}
          class="text-skin-gray pl-2"
        >
          <IoSend size={22} />
        </span>
      </label>
    </form>
  );
};

export default ChatForm;
