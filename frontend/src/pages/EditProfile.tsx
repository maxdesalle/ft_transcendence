import { Link } from 'solid-app-router';
import { Component, createEffect, createSignal, Match, Switch } from 'solid-js';
import { changeAvatar } from '../api/user';
import Modal from '../components/Modal';
import { useStore } from '../store';

const EditProfile: Component = () => {
  const [newName, setNewName] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [image, setImage] = createSignal<File | null>(null);
  const [
    state,
    { changeUsername, activate2fa, deactivate2fa, updateAvatarId },
  ] = useStore();

  const onChangeName = () => {
    if (newName() && changeUsername) {
      changeUsername(newName());
      setNewName('');
    }
  };

  const onActivate2fa = () => {
    if (activate2fa) {
      activate2fa();
    }
    setIsOpen(true);
  };

  const onDeactivate2fa = () => {
    if (deactivate2fa) {
      deactivate2fa();
    }
  };

  const onImageUpload = () => {
    if (!image()) return;
    const formData = new FormData();
    formData.append('file', image()!, image()!.name);
    changeAvatar(formData)
      .then((e) => {
        updateAvatarId();
      })
      .catch((e) => console.log(e));
  };

  return (
    <div class="pt-5 text-white flex">
      <div class="p-2">
        <h1>Change name</h1>
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
      </div>
      <div class="p-2">
        <h1 class="text-center">2 fa</h1>
        <Switch>
          <Match
            when={!state.currentUser.userData?.isTwoFactorAuthenticationEnabled}
          >
            <button onClick={onActivate2fa} class="btn-primary">
              Activate 2fa
            </button>
          </Match>
          <Match
            when={state.currentUser.userData?.isTwoFactorAuthenticationEnabled}
          >
            <button class="btn-primary" onClick={onDeactivate2fa}>
              Deactivate 2fa
            </button>
          </Match>
        </Switch>
        <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
          <img src={state.currentUser.twoFaQrCode} alt="qr code" />
          <Link href="/login">Go back to login</Link>
        </Modal>
      </div>
      <div class="flex flex-col w-fit p-2">
        <label for="avatar">Change Avatar</label>
        <input
          onChange={(e) => {
            if (e.currentTarget.files) {
              setImage(e.currentTarget.files[0]);
            }
          }}
          type="file"
          accept="image/*"
          id="avatar"
        />
        <button onClick={onImageUpload} class="btn-primary w-fit mt-5">
          Change Avatar
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
