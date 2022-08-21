import { Outlet } from 'solid-app-router';
import { Component } from 'solid-js';

const Layout: Component = () => {
  return (
    <div class="lg:container">
      <Outlet />
    </div>
  );
};

export default Layout;
