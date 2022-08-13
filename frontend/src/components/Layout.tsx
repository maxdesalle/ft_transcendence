import { Outlet } from 'solid-app-router';
import { Component } from 'solid-js';

const Layout: Component = () => {
  return (
    <div class="container h-90">
      <Outlet />
    </div>
  );
};

export default Layout;
