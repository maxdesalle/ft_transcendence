import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import { User } from '../types/user.interface';

const FriendCard: React.FC<{
  friend: User,
  onSelectFriend?: (friend: User) => void
}> = ({ friend, onSelectFriend }) => {
  return (
    <>
      {friend && (
        <Box
          onClick={() => {
            if (onSelectFriend !== undefined) {
              onSelectFriend(friend);
            }
          }}
          sx={{ p: '10px' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar />
            <Box
              sx={{
                ml: '5px',
                borderBottom: 1,
                borderColor: 'divider',
                width: '100%',
              }}
            >
              <Typography variant="subtitle1">{friend.display_name}</Typography>
              <Typography variant="body2">Last message</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default FriendCard;
