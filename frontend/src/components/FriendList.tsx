import { Stack, Typography } from "@mui/material";
import { useGetAllFriends } from "../api/friends";
import FriendCard from "./FriendCard";

const FriendList = () => {
  const { friendsIds } = useGetAllFriends();

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Friend List</Typography>
      {friendsIds &&
        friendsIds.map((id) => <FriendCard key={id} user_id={id} />)}
    </Stack>
  );
};

export default FriendList;
