import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";

const MessageCard = styled("div")(({}) => ({
  marginRight: "20px",
  marginBottom: "10px",
  padding: "10px",
  backgroundColor: "#f8e896",
  width: "60%",
  maxWidth: "300px",
  textAlign: "left",
  border: "1px solid #dfd087",
  borderRadius: "10px",
  alignSelf: "end",
}));

const Timestamp = styled("p")(({}) => ({
  fontSize: ".85em",
  fontWeight: "300",
  textAlign: "right",
}));

const ChatMessageRight = ({
  message,
  timestamp,
}: {
  message: string;
  timestamp: string;
}) => {
  return (
    <MessageCard>
      <Box component="div">
        <Typography
          sx={{ overflowWrap: "break-word" }}
          fontSize={15}
          m={0}
          p={0}
          paragraph
        >
          {message}
        </Typography>
      </Box>
      <Timestamp>{timestamp}</Timestamp>
    </MessageCard>
  );
};

export default ChatMessageRight;
