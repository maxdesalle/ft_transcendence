"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_1 = require("../api/auth");
const user_1 = require("../api/user");
const UploadAvatar_1 = require("../components/UploadAvatar");
const utils_1 = require("../api/utils");
const qrcode_1 = require("qrcode");
function Settings() {
    const { imageUrl } = (0, user_1.useGetAvatar)();
    const { mutate } = (0, auth_1.useDeactivateTwoFactorAuth)();
    const [url, setUrl] = (0, react_1.useState)(null);
    const { data: user } = (0, auth_1.useGetProfile)();
    const { data, isSuccess } = (0, auth_1.useActivateTwoFactorAuth)(url);
    const [qrCode, setQrCode] = (0, react_1.useState)("");
    const [anchroEl, setAnchorEl] = (0, react_1.useState)(null);
    const handleClick = (e) => {
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
    (0, react_1.useEffect)(() => {
        if (isSuccess) {
            console.log("Data ", data);
            qrcode_1.default.toDataURL(data.otpauthUrl, function (err, url) {
                console.log(err);
                setQrCode(url);
            });
        }
    }, [isSuccess, user]);
    return (<material_1.Grid sx={{
            paddingTop: 20,
            height: "95vh",
        }} container direction="column" alignItems="center" spacing={4}>
      <material_1.Grid item>
        <material_1.Avatar sx={{
            width: 150,
            height: 150,
        }} variant="rounded" src={imageUrl}/>
        <material_1.Box sx={{
            paddingTop: 4,
        }}>
          <UploadAvatar_1.default />
        </material_1.Box>
      </material_1.Grid>
      <material_1.Grid item>
        {user && user.isTwoFactorAuthenticationEnabled ? (<material_1.Button variant="contained" onClick={() => {
                handleChange();
            }}>
            Deactivate 2fa
          </material_1.Button>) : (<material_1.Box>
            <material_1.Button variant="contained" onClick={(e) => {
                setUrl(utils_1.routes.activate2fa);
                handleClick(e);
            }}>
              Activate 2fa
            </material_1.Button>
            <material_1.Popover sx={{
                width: "350px",
                height: "350px",
            }} id={id} open={open} anchorEl={anchroEl} onClose={handleClose} anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}>
              {qrCode && <img src={qrCode}/>}
            </material_1.Popover>
          </material_1.Box>)}
      </material_1.Grid>
      <material_1.Grid item>
        <material_1.Button variant="contained" to="/" component={react_router_dom_1.Link}>
          Back Home
        </material_1.Button>
      </material_1.Grid>
    </material_1.Grid>);
}
exports.default = Settings;
//# sourceMappingURL=Settings.js.map