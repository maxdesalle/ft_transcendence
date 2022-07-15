import { Component } from "solid-js";
import CreateRoom from "../components/admin/createRoom";

const Admin: Component = () => {
  return (
    <div class="text-white pt-5 grid grid-cols-3">
      <div>
        <CreateRoom />
      </div>
    </div>
  );
};

export default Admin;
