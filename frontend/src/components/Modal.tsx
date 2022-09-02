import { Component, JSXElement, Setter, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

const Modal: Component<{
  children?: JSXElement;
  bgColor?: string;
  class?: string;
  isOpen: boolean;
  toggleModal?: Setter<boolean>;
}> = (props) => {
  const onClose = () => {
    if (!props.isOpen) return;
    if (props.toggleModal) props.toggleModal(!props.isOpen);
  };
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div
          classList={{ [props.bgColor as any]: !!props.bgColor }}
          onClick={onClose}
          class={`fixed z-10 top-0 w-full h-full right-0 left-0 bottom-0`}
        />
      </Portal>
      <div
        class={`z-50 fixed`}
        classList={{ [props.class as any]: !!props.class }}
      >
        {props.children}
      </div>
    </Show>
  );
};

export default Modal;
