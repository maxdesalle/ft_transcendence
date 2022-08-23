import { Component, createSignal, Match, Switch } from 'solid-js';
import {
  activate2fa,
  changeAvatar,
  changeDisplayName,
  deactivate2fa,
} from '../api/user';
import Modal from '../components/Modal';
import QRCode from 'qrcode';
import { notifyError, notifySuccess } from '../utils/helpers';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store/all';
import { useSockets } from '../Providers/SocketProvider';

const EditProfile: Component = () => {
  const [newName, setNewName] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [image, setImage] = createSignal<File | null>(null);
  const [pathUrl, setPathUrl] = createSignal('');
  const [auth, { setUser, setUserAvatarId, setToken, setIsAuth }] = useAuth();
  const [_, { resetStore }] = useStore();
  const [sockes, { disconnect }] = useSockets();

  const onChangeName = () => {
    if (newName()) {
      changeDisplayName(newName()).then((res) => setUser(res.data));
      setNewName('');
    }
  };

  const onActivate2fa = () => {
    activate2fa()
      .then((res) => {
        QRCode.toDataURL(res.otpauthUrl, (_, url) => {
          setPathUrl(url);
        });
        notifySuccess('2fa activated please scan the qr code');
      })
      .catch((err) => {
        notifyError(err.message);
      });
    setIsOpen(true);
  };

  const onDeactivate2fa = () => {
    deactivate2fa()
      .then(() => notifySuccess('2fa deactivated'))
      .catch((err) => notifyError(err.message));
  };

  const onImageUpload = () => {
    if (!image()) return;
    const formData = new FormData();
    formData.append('file', image()!, image()!.name);
    changeAvatar(formData)
      .then((res) => {
        setUserAvatarId(res.data);
        notifySuccess('Great success 🙂');
      })
      .catch(() => notifyError('error 😥'));
  };

  const onNavigate = () => {
    resetStore();
    setToken(undefined);
    setIsAuth(false);
    disconnect();
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
          <Match when={!auth.user.isTwoFactorAuthenticationEnabled}>
            <button onClick={onActivate2fa} class="btn-primary">
              Activate 2fa
            </button>
          </Match>
          <Match when={auth.user.isTwoFactorAuthenticationEnabled}>
            <button class="btn-primary" onClick={onDeactivate2fa}>
              Deactivate 2fa
            </button>
          </Match>
        </Switch>
        <Modal class="bg-purple-300 opacity-30 z-30" isOpen={isOpen()}>
          <div class="flex bg-skin-page gap-2 flex-col opacity-100 p-2 border border-header-menu">
            <h1 class="text-xl p-2">Please scan the QR code</h1>
            <img src={pathUrl()} alt="qr code" />
            <button class="btn-primary w-full px-2 py-4" onClick={onNavigate}>
              Go back to login
            </button>
          </div>
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
