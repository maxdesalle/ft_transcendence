import { Component, createEffect, createSignal } from "solid-js";
import Modal from "../components/Modal";
import { useStore } from "../store";

const EditProfile: Component = () => {
  const [newName, setNewName] = createSignal("");
  const [isOpen, setIsOpen] = createSignal(false);
  const [state, { changeUsername, activate2fa }] = useStore();

  const onChangeName = () => {
    if (newName() && changeUsername) {
      changeUsername(newName());
      setNewName("");
    }
  };

  const onActivate2fa = () => {
    if (activate2fa) {
      activate2fa();
    }
    setIsOpen(true);
  };

  return (
    <div class="pt-5 text-white">
      <h1>{state.currentUser.userData?.display_name}</h1>
      <div class="flex flex-col w-80">
        <input
          onInput={(e) => setNewName(e.currentTarget.value)}
          type="text"
          value={newName()}
          class="p-1 focus:outline-none bg-skin-menu-background rounded-sm"
          placeholder="Enter new name"
        />
        <button onClick={onChangeName} class="btn-primary w-fit mt-5">
          Change name
        </button>
      </div>
      <div>
        <button onClick={onActivate2fa} class="btn-primary">
          Activate 2fa
        </button>
        <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
          <img src={state.currentUser.twoFaQrCode} alt="qr code" />
        </Modal>
      </div>
    </div>
  );
};

export default EditProfile;
