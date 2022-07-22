import { useParams } from "solid-app-router";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { useStore } from "../store";
import { User } from "../types/user.interface";

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
    <div>
      <h1>{user()?.display_name}</h1>
    </div>
  );
};

export default Profile;
