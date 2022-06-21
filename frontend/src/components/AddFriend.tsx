import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAddFriendById, useGetPendingFriendRequest } from "../api/friends";
import AcceptFriendRequest from "./AcceptFriendRequest";

const AddFriend = () => {
  const { mutate, status } = useAddFriendById();
  const { pendingRequests } = useGetPendingFriendRequest();
  const [userId, setUserId] = useState(0);

  const onAddFriend = () => {
    if (!userId) return;
    mutate({ user_id: userId });
  };

  return (
    <Stack spacing={2}>
      <TextField
        type="number"
        label="user id"
        onChange={(e) => setUserId(parseInt(e.target.value))}
      />
      <Button variant="contained" onClick={() => onAddFriend()}>
        Add friend
      </Button>
      <Stack spacing={2}>
        <Typography>Pending requests</Typography>
        {pendingRequests &&
          pendingRequests.map((id) => <AcceptFriendRequest key={id} id={id} />)}
      </Stack>
      {status == "success" ? (
        <Typography color="greenyellow">success</Typography>
      ) : null}
    </Stack>
  );
};

export default AddFriend;
