import { Box, Typography } from "@mui/material";
import { User } from "../types/user.interface";

const UserCard: React.FC<{ user: User, onClick?: () => void }> = ({ user, onClick }) => {
    return (
        <Box onClick={() => {
            if (onClick) {
                onClick()
            }
        }}>
            <Typography>{user.login42}</Typography>
        </Box>
    )
}

export default UserCard;