import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";
import ChatPopover from "./ChatPopover";

function Layout() {
  return (
    <Container sx={{ height: "89vh" }}>
      <Outlet />
      <ChatPopover />
    </Container>
  );
}

export default Layout;
