import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetProfile, useMockLogin, useTwoFactorAuth } from "../api/auth";
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { routes } from "../api/utils";

function Login() {
  const { mutate } = useTwoFactorAuth();
  const [code, setCode] = useState("");
  const [login42, setLogin42] = useState("");
  const { mutate: mockMutate, status } = useMockLogin();
  const [isTwoFa, setIsTwoFa] = useState(false);
  const navigate = useNavigate();
  const { isSuccess: loggedin } = useGetProfile();

  const login = () => {
    window.location.href = routes.login42;
  };

  const confirmCode = () => {
    if (!code) return;
    mutate(
      { twoFactorAuthenticationCode: code },
      {
        onSuccess: () => navigate("/"),
      }
    );
  };

  const onMockLogin = () => {
    if (!login42) return;
    mockMutate(
      { login42 },
      {
        onSuccess: (res) => {
          setIsTwoFa(res.data.twoFa);
        },
      }
    );
  };

  useEffect(() => {
    if (status == "success" || loggedin) {
      navigate("/");
    }
  }, [status, loggedin]);

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
        padding: "15px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ height: "100%", padding: "15px", maxHeight: "400px" }}>
        <Stack spacing={3} pb={3}>
          <TextField
            label="Username"
            variant="standard"
            onChange={(e) => setLogin42(e.target.value)}
          />
          <Button
            onClick={() => onMockLogin()}
            variant="contained"
            color="secondary"
          >
            Login using the Mock api
          </Button>
          <Button onClick={login} variant="contained">
            Login using 42
          </Button>
        </Stack>
        {isTwoFa ? (
          <Stack spacing={3}>
            <Typography
              component="label"
              textAlign="center"
              htmlFor="2fauthcode"
            >
              Enter 2fa code to login
            </Typography>
            <input
              type="text"
              id="2fauthcode"
              onChange={(e) => setCode(e.target.value)}
            />

            <Button onClick={() => confirmCode()} variant="contained">
              Confirm
            </Button>
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
}

export default Login;
