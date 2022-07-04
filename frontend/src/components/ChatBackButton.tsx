import { ArrowBack } from '@mui/icons-material';
import { IconButton } from '@mui/material';

const ChatBackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <ArrowBack />
    </IconButton>
  );
};

export default ChatBackButton;
