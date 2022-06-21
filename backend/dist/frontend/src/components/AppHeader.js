"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const styles_1 = require("@mui/material/styles");
const AppBar_1 = require("@mui/material/AppBar");
const Box_1 = require("@mui/material/Box");
const Toolbar_1 = require("@mui/material/Toolbar");
const IconButton_1 = require("@mui/material/IconButton");
const InputBase_1 = require("@mui/material/InputBase");
const MenuItem_1 = require("@mui/material/MenuItem");
const Menu_1 = require("@mui/material/Menu");
const Search_1 = require("@mui/icons-material/Search");
const AccountCircle_1 = require("@mui/icons-material/AccountCircle");
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const auth_1 = require("../api/auth");
const react_query_1 = require("react-query");
const user_1 = require("../api/user");
const react_1 = require("react");
const react_router_dom_2 = require("react-router-dom");
const Search = (0, styles_1.styled)("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: (0, styles_1.alpha)(theme.palette.common.white, 0.15),
    "&:hover": {
        backgroundColor: (0, styles_1.alpha)(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));
const SearchIconWrapper = (0, styles_1.styled)("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));
const StyledInputBase = (0, styles_1.styled)(InputBase_1.default)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "20ch",
        },
    },
}));
function AppHeader() {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const queryclient = (0, react_query_1.useQueryClient)();
    const isMenuOpen = Boolean(anchorEl);
    const { users } = (0, user_1.useGetAllUsers)();
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleMenuClick = (path) => {
        handleMenuClose();
        navigate(path);
    };
    (0, react_1.useEffect)(() => {
        console.log(users);
    }, [users]);
    const menuId = "primary-search-account-menu";
    const renderMenu = (<Box_1.default alignSelf="end">
      <IconButton_1.default onClick={handleProfileMenuOpen}>
        <AccountCircle_1.default />
      </IconButton_1.default>
      <Menu_1.default anchorEl={anchorEl} anchorOrigin={{
            vertical: "top",
            horizontal: "right",
        }} id={menuId} keepMounted transformOrigin={{
            vertical: "top",
            horizontal: "right",
        }} open={isMenuOpen} onClose={handleMenuClose}>
        <MenuItem_1.default onClick={() => handleMenuClick("/profile")}>Profile</MenuItem_1.default>
        <MenuItem_1.default onClick={() => handleMenuClick("leaderboard")}>
          LeaderBoard
        </MenuItem_1.default>
        <MenuItem_1.default onClick={() => handleMenuClick("/settings")}>
          Settings
        </MenuItem_1.default>
        <MenuItem_1.default onClick={() => handleMenuClick("/admin")}>Admin</MenuItem_1.default>
        <MenuItem_1.default onClick={() => (0, auth_1.logout)(queryclient, navigate)}>
          Logout
        </MenuItem_1.default>
      </Menu_1.default>
    </Box_1.default>);
    return (<Box_1.default sx={{ flexGrow: 1 }}>
      <AppBar_1.default position="static">
        <Toolbar_1.default>
          <material_1.Avatar component={react_router_dom_2.Link} to="/"/>
          <Box_1.default sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
        }}>
            <Search>
              <SearchIconWrapper>
                <Search_1.default />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }}/>
            </Search>
            {renderMenu}
          </Box_1.default>
        </Toolbar_1.default>
      </AppBar_1.default>
    </Box_1.default>);
}
exports.default = AppHeader;
//# sourceMappingURL=AppHeader.js.map