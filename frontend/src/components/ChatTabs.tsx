import { Avatar, Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useGetRooms } from '../api/chat';
import { useGetAllFriendsObjects } from '../api/friends';
import { RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import FriendCard from './FriendCard';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ChatTabs: React.FC<{
  onSelectRoom: (room: RoomInfoShort) => void;
  onSelectFriend: (friend: User) => void;
}> = ({ onSelectRoom, onSelectFriend }) => {
  const [value, setValue] = useState(0);
  const { friends } = useGetAllFriendsObjects();
  const { rooms } = useGetRooms();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const renderFriends = () => {
    return (
      <Stack spacing={1}>
        {friends &&
          friends.map((friend) => (
            <FriendCard
              friend={friend}
              key={friend.id}
              onSelectFriend={onSelectFriend}
            />
          ))}
      </Stack>
    );
  };

  const renderRooms = () => {
    return (
      <Stack spacing={1} p={1}>
        {rooms &&
          rooms
            .filter((room) => room.type !== 'DM')
            .map((room) => (
              <Box
                component="button"
                onClick={() => onSelectRoom(room)}
                key={room.room_id}
                sx={{ display: 'flex', padding: '3px', borderRadius: '5px' }}
              >
                <Avatar />
                <Stack pl={2}>
                  <Typography textAlign="start">{room.room_name}</Typography>
                  <Typography component="p">last message</Typography>
                </Stack>
              </Box>
            ))}
      </Stack>
    );
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'end',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Friends" {...a11yProps(1)} />
          <Tab label="Chat rooms" {...a11yProps(0)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {renderFriends()}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {renderRooms()}
      </TabPanel>
    </Box>
  );
};

export default ChatTabs;
