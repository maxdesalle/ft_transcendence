import { Card, Typography } from "@mui/material";
import { useGetUserById } from "../api/user";

const FriendCard: React.FC<{ user_id: number }> = ({ user_id }) => {
  const { data: user } = useGetUserById(user_id);

  return (
    <>
      {user && (
        <Card title={user.login42}>
          <Typography variant="h5" sx={{ padding: "5px" }}>
            {user.login42}
          </Typography>
        </Card>
      )}
    </>
  );
};

export default FriendCard;
