import { Button, Popover } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { Box } from "@mui/system";
import { useState } from "react";
import Chat from "./Chat";

const ChatPopover = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
      }}
    >
      <Button onClick={handleClick}>
        <ChatIcon />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Chat />
      </Popover>
    </Box>
  );
};

export default ChatPopover;
