import { Link, useParams } from 'solid-app-router';
import { Component, createEffect, createSignal, onMount, Show } from 'solid-js';
import Avatar from '../components/Avatar';
import { useStore } from '../store';
import { User } from '../types/user.interface';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { generateImageUrl } from '../utils/helpers';

const Profile: Component = () => {
  const params = useParams();
  const [state] = useStore();
  const [user, setUser] = createSignal<User>();

  onMount(() => {
    setUser(state.users?.find((user) => user.id == parseInt(params.id)));
  });

  createEffect(() => {
    setUser(state.users?.find((user) => user.id == parseInt(params.id)));
  });
  return (
    <Show when={user()}>
      <div class="text-white">
        <img
          class="w-40 h-44 mt-5"
          src={
            user()!.avatarId
              ? generateImageUrl(user()!.avatarId)
              : defaultAvatar
          }
        />
        <h1>{user()!.display_name}</h1>
      </div>
      <ul class="flex flex-col divide-y text-white">
        <li class="divide-y ">
          <Link href="/edit_profile">Edit profile</Link>
        </li>
        <li>
          <button>Sign out</button>
        </li>
      </ul>
    </Show>
  );
};

export default Profile;
