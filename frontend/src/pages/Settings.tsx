import { Avatar, Box, Button, Grid, Popover } from "@mui/material";
import { useEffect, useState, MouseEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  useActivateTwoFactorAuth,
  useDeactivateTwoFactorAuth,
  useGetProfile,
} from "../api/auth";
import { useGetAvatar } from "../api/user";
import UploadAvatar from "../components/UploadAvatar";
import { routes } from "../api/utils";
import QRCode from "qrcode";

function Settings() {
  const { imageUrl } = useGetAvatar();
  const { mutate } = useDeactivateTwoFactorAuth();
  const [url, setUrl] = useState<string | null>(null);
  const { data: user } = useGetProfile();
  const { data, isSuccess } = useActivateTwoFactorAuth(url);
  const [qrCode, setQrCode] = useState("");
  const [anchroEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchroEl);
  const id = open ? "simple-popover" : undefined;

  const handleChange = () => {
    mutate(null);
  };

  useEffect(() => {
    if (isSuccess) {
      console.log("Data ", data);
      QRCode.toDataURL(data.otpauthUrl, function (err, url) {
        console.log(err);
        setQrCode(url);
      });
    }
  }, [isSuccess, user]);

  return (
    <Grid
      sx={{
        paddingTop: 20,
        height: "95vh",
      }}
      container
      direction="column"
      alignItems="center"
      spacing={4}
    >
      <Grid item>
        <Avatar
          sx={{
            width: 150,
            height: 150,
          }}
          variant="rounded"
          src={imageUrl}
        />
        <Box
          sx={{
            paddingTop: 4,
          }}
        >
          <UploadAvatar />
        </Box>
      </Grid>
      <Grid item>
        {user && user.isTwoFactorAuthenticationEnabled ? (
          <Button
            variant="contained"
            onClick={() => {
              handleChange();
            }}
          >
            Deactivate 2fa
          </Button>
        ) : (
          <Box>
            <Button
              variant="contained"
              onClick={(e) => {
                setUrl(routes.activate2fa);
                handleClick(e);
              }}
            >
              Activate 2fa
            </Button>
            <Popover
              sx={{
                width: "350px",
                height: "350px",
              }}
              id={id}
              open={open}
              anchorEl={anchroEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
            >
              {qrCode && <img src={qrCode} />}
            </Popover>
          </Box>
        )}
      </Grid>
      <Grid item>
        <Button variant="contained" to="/" component={RouterLink}>
          Back Home
        </Button>
      </Grid>
    </Grid>
  );
}

export default Settings;
