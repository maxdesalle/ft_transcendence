import { Component, JSXElement } from "solid-js";
import { User } from "../types/user.interface";
import Avatar from "./Avatar";

const UserCard: Component<{
  user: User;
  onClick?: () => void;
  bgColor?: string;
}> = (props) => {
  return (
    <div class={`p-2 pl-4 pt-3 flex justify-between ${props.bgColor}`}>
      <div class="flex items-center">
        <Avatar />
        <h1 class="pl-4">{props.user.display_name}</h1>
      </div>
      <button onClick={props.onClick} class="btn-primary">
        Profile
      </button>
    </div>
  );
};

export default UserCard;
