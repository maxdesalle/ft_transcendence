import { Box } from "@mui/material";
import AddFriend from "../components/AddFriend";
import AddUserToRoom from "../components/AddUserToRoom";
import CreateRoom from "../components/CreateRoom";
import FriendList from "../components/FriendList";

const Admin = () => {
  return (
    <Box
      sx={{
        display: "flex",
        paddingTop: 5,
        height: "100%",
      }}
    >
      <Box sx={{ minWidth: 250, padding: 2 }}>
        <CreateRoom />
      </Box>
      <Box sx={{ minWidth: 250, padding: 2 }}>
        <AddUserToRoom />
      </Box>
      <Box sx={{ minWidth: 250, padding: 2 }}>
        <AddFriend />
      </Box>
      <Box sx={{ minWidth: 250, padding: 2 }}>
        <FriendList />
      </Box>
    </Box>
  );
};

export default Admin;
