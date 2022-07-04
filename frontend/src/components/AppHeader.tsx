import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Avatar, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout, useGetProfile } from '../api/auth';
import { useQueryClient } from 'react-query';
import { useGetAllUsers } from '../api/user';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserCard from './UserCard';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function AppHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const queryclient = useQueryClient();
  const isMenuOpen = Boolean(anchorEl);
  const { users } = useGetAllUsers();
  const { me } = useGetProfile();
  const [value, setValue] = useState<string>("");

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Box alignSelf="end">
      <IconButton onClick={handleProfileMenuOpen}>
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuClick('/profile')}>Profile</MenuItem>
        <MenuItem onClick={() => handleMenuClick('leaderboard')}>
          LeaderBoard
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/settings')}>
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/admin')}>Admin</MenuItem>
        <MenuItem onClick={() => logout(queryclient, navigate)}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Avatar component={Link} to="/" />
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                onChange={(e) => setValue(e.target.value)}
                value={value}
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
            {renderMenu}
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: 'relative', maxWidth: '240px', ml: '85px' }}>
        <Paper sx={{ float: 'inline-start', position: 'absolute', zIndex: 10, width: '100%' }}>
          {users &&
            users
              .filter((user) => user.login42.toLowerCase().includes(value) && user.id !== me?.id && value.length > 0)
              .map((user) => (
                <Box>
                  <UserCard key={user.id} onClick={() => {
                    setValue('');
                    navigate(`user_profile/${user.id}`);
                  }}
                    user={user} />
                </Box>
              ))}
        </Paper>
      </Box>
    </Box>
  );
}

export default AppHeader;
