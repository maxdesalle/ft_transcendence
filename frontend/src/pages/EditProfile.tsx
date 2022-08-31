import { Component, createSignal, Match, Switch } from 'solid-js';
import {
  activate2fa,
  changeAvatar,
  changeDisplayName,
  deactivate2fa,
} from '../api/user';
import Modal from '../components/Modal';
import QRCode from 'qrcode';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store/all';
import { useSockets } from '../Providers/SocketProvider';
import { useNavigate } from 'solid-app-router';
import Cookies from 'js-cookie';
import { forget } from 'turbo-solid';
import defaultAvatar from '../../../backend/images/avatardefault.png';

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
      changeDisplayName(newName()).then((res) => {
        setUser(res.data);
        notifySuccess(`Name changed to ${res.data.display_name}`);
      });
      setNewName('');
    }
  };

  const onActivate2fa = () => {
    activate2fa()
      .then((res) => {
        QRCode.toDataURL(res.otpauthUrl, (_, url) => {
          setPathUrl(url);
        });
        setUser({ ...auth.user, isTwoFactorAuthenticationEnabled: true });
        notifySuccess('2fa activated please scan the qr code');
      })
      .catch((err) => {
        notifyError(err.message);
      });
    setIsOpen(true);
  };

  const navigate = useNavigate();

  const logout = () => {
    setToken(undefined);
    Cookies.remove('jwt_token', { sameSite: 'none', secure: true });
    forget();
    resetStore();
    disconnect();
    setIsAuth(false);
    navigate('/login');
  };
  const onDeactivate2fa = () => {
    deactivate2fa()
      .then(() => {
        logout();
        navigate('/login');
      })
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
    logout();
  };

  return (
    <div class="pt-5 flex">
      <div class="p-2">
        <h1 class="text-xl pb-1 font-semibold">Change name</h1>
        <div class="flex flex-col w-80">
          <input
            onInput={(e) => setNewName(e.currentTarget.value)}
            type="text"
            value={newName()}
            class="input focus:outline-none input-bordered"
            placeholder="Enter new name"
          />
          <button onClick={onChangeName} class="btn-primary btn w-fit mt-5">
            Change name
          </button>
        </div>
      </div>
      <div class="p-2">
        <Switch>
          <Match when={!auth.user.isTwoFactorAuthenticationEnabled}>
            <h1 class="text-xl font-semibold">Activate 2fa</h1>
            <button onClick={onActivate2fa} class="btn-primary btn">
              Activate
            </button>
          </Match>
          <Match when={auth.user.isTwoFactorAuthenticationEnabled}>
            <div class="flex flex-col gap-2">
              <h1 class="text-xl font-semibold">deactivate 2fa</h1>
              <button class="btn-primary btn" onClick={onDeactivate2fa}>
                Deactivate
              </button>
            </div>
          </Match>
        </Switch>
        <Modal bgColor="bg-purple-300 opacity-30 z-30" isOpen={isOpen()}>
          <div class="flex bg-skin-page gap-2 flex-col opacity-100 p-2 border border-header-menu">
            <h1 class="text-xl p-2">Please scan the QR code</h1>
            <img src={pathUrl()} alt="qr code" />
            <button class="btn-primary w-full px-2 py-4" onClick={onNavigate}>
              Go back to login
            </button>
          </div>
        </Modal>
      </div>
      <div class="flex flex-col w-fit p-2 gap-2">
        <p class="text-xl font-semibold">Change Avatar</p>
        <div class="avatar">
          <div class="w-24 rounded">
            <img
              src={
                auth.user.avatarId
                  ? generateImageUrl(auth.user.avatarId)
                  : defaultAvatar
              }
              alt="avatar"
            />
          </div>
        </div>
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
        <button onClick={onImageUpload} class="btn-primary btn w-fit">
          Change Avatar
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
