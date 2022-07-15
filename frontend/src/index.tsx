/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "solid-app-router";

import "./index.css";
import App from "./App";
import { StoreProvider } from "./store/index";

render(
  () => (
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
