"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("@mui/material/Button");
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const auth_1 = require("../api/auth");
const material_1 = require("@mui/material");
const utils_1 = require("../api/utils");
function Login() {
    const { mutate } = (0, auth_1.useTwoFactorAuth)();
    const [code, setCode] = (0, react_1.useState)("");
    const [login42, setLogin42] = (0, react_1.useState)("");
    const { mutate: mockMutate, status } = (0, auth_1.useMockLogin)();
    const [isTwoFa, setIsTwoFa] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { isSuccess: loggedin } = (0, auth_1.useGetProfile)();
    const login = () => {
        window.location.href = utils_1.routes.login42;
    };
    const confirmCode = () => {
        if (!code)
            return;
        mutate({ twoFactorAuthenticationCode: code }, {
            onSuccess: () => navigate("/"),
        });
    };
    const onMockLogin = () => {
        if (!login42)
            return;
        mockMutate({ login42 }, {
            onSuccess: (res) => {
                setIsTwoFa(res.data.twoFa);
            },
        });
    };
    (0, react_1.useEffect)(() => {
        if (status == "success" || loggedin) {
            navigate("/");
        }
    }, [status, loggedin]);
    return (<material_1.Stack sx={{
            width: "100%",
            height: "100%",
            padding: "15px",
            alignItems: "center",
            justifyContent: "center",
        }}>
      <material_1.Paper sx={{ height: "100%", padding: "15px", maxHeight: "400px" }}>
        <material_1.Stack spacing={3} pb={3}>
          <material_1.TextField label="Username" variant="standard" onChange={(e) => setLogin42(e.target.value)}/>
          <Button_1.default onClick={() => onMockLogin()} variant="contained" color="secondary">
            Login using the Mock api
          </Button_1.default>
          <Button_1.default onClick={login} variant="contained">
            Login using 42
          </Button_1.default>
        </material_1.Stack>
        {isTwoFa ? (<material_1.Stack spacing={3}>
            <material_1.Typography component="label" textAlign="center" htmlFor="2fauthcode">
              Enter 2fa code to login
            </material_1.Typography>
            <input type="text" id="2fauthcode" onChange={(e) => setCode(e.target.value)}/>

            <Button_1.default onClick={() => confirmCode()} variant="contained">
              Confirm
            </Button_1.default>
          </material_1.Stack>) : null}
      </material_1.Paper>
    </material_1.Stack>);
}
exports.default = Login;
//# sourceMappingURL=Login.js.map