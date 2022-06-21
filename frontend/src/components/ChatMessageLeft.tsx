import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const MessageCard = styled("div")(({}) => ({
  marginLeft: "20px",
  marginBottom: "10px",
  padding: "10px",
  backgroundColor: "#A8DDFD",
  width: "60%",
  maxWidth: "300px",
  textAlign: "left",
  border: "1px solid #97C6E3",
  borderRadius: "10px",
  alignSelf: "start",
}));

const Timestamp = styled("p")(({}) => ({
  fontSize: ".85em",
  fontWeight: "300",
  textAlign: "right",
}));

const ChatMessageLeft = ({
  message,
  name,
  timestamp,
}: {
  message: string;
  name: string;
  timestamp: string;
}) => {
  return (
    <>
      <Typography pl={3}>{name}</Typography>
      <MessageCard>
        <Box>
          <Typography sx={{ overflowWrap: "break-word" }}>{message}</Typography>
        </Box>
        <Timestamp>{timestamp}</Timestamp>
      </MessageCard>
    </>
  );
};

export default ChatMessageLeft;
