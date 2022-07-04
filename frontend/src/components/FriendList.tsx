import { Stack, Typography } from '@mui/material';
import { useGetAllFriendsIds, useGetAllFriendsObjects } from '../api/friends';
import FriendCard from './FriendCard';

const FriendList = () => {
  const { friends } = useGetAllFriendsObjects();

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Friend List</Typography>
      {friends &&
        friends.map((friend) => <FriendCard key={friend.id} friend={friend} />)}
    </Stack>
  );
};

export default FriendList;
