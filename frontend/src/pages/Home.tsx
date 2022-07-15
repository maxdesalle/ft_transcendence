import { Component, createSignal } from "solid-js";
import usePopper from "solid-popper";
import Modal from "../components/Modal";

const Home: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal<any>();
  const [popper, setPopper] = createSignal<any>();

  usePopper(anchor, popper, {
    placement: "top-start",
  });

  return (
    <>
      <h1>Home</h1>
      <button
        ref={setAnchor}
        onClick={() => setIsOpen(true)}
        class="btn-primary"
      >
        Open
      </button>
      <div ref={setPopper}>
        <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
          <p class="text-black">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa vitae
            nihil inventore architecto soluta, totam sunt, doloremque numquam
            dignissimos molestias quos iure assumenda. Amet aspernatur excepturi
            rem, cum dignissimos autem?
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Home;
