import { Box, Button, Card, Typography } from "@mui/material";
import { useAcceptFriendRequest, useRejectFriendRequest } from "../api/friends";
import { useGetUserById } from "../api/user";

const AcceptFriendRequest: React.FC<{ id: number }> = ({ id }) => {
  const { data: user } = useGetUserById(id);
  const { mutate } = useAcceptFriendRequest();
  const { mutate: rejectMutate } = useRejectFriendRequest();

  const onAccept = () => {
    if (!id) return;
    mutate({ user_id: id });
  };

  const onReject = () => {
    if (!id) return;
    rejectMutate({ user_id: id });
  };
  return (
    <Card sx={{ padding: "5px" }}>
      {user && (
        <>
          <Typography sx={{ textAlign: "center", padding: "5px" }}>
            {user.login42}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <Button variant="contained" onClick={() => onAccept()}>
              Accept
            </Button>
            <Button
              onClick={() => onReject()}
              variant="contained"
              color="secondary"
            >
              reject
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
};

export default AcceptFriendRequest;
