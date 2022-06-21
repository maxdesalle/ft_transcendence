"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Home_1 = require("./pages/Home");
const Login_1 = require("./pages/Login");
const auth_1 = require("./api/auth");
const react_1 = require("react");
const Profile_1 = require("./pages/Profile");
const AppHeader_1 = require("./components/AppHeader");
const Layout_1 = require("./components/Layout");
const LeaderBoard_1 = require("./pages/LeaderBoard");
const Settings_1 = require("./pages/Settings");
const TwoFactorAuth_1 = require("./components/TwoFactorAuth");
const js_cookie_1 = require("js-cookie");
const Admin_1 = require("./pages/Admin");
function App() {
    const { status, data: user } = (0, auth_1.useGetProfile)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        if (status == "error") {
            navigate("/login");
        }
        else if (status == "success") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("jwt_token", js_cookie_1.default.get("jwt_token"));
        }
    }, [status]);
    return (<>
      {status == "success" ? <AppHeader_1.default /> : null}
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/" element={<Layout_1.default />}>
          <react_router_dom_1.Route path="/" element={<Home_1.default />}/>
          <react_router_dom_1.Route path="/login" element={<Login_1.default />}/>
          <react_router_dom_1.Route path="/profile" element={<Profile_1.default />}/>
          <react_router_dom_1.Route path="/leaderboard" element={<LeaderBoard_1.default />}/>
          <react_router_dom_1.Route path="/settings" element={<Settings_1.default />}/>
          <react_router_dom_1.Route path="/2fa" element={<TwoFactorAuth_1.TwoFactorAuth />}/>
          <react_router_dom_1.Route path="/admin" element={<Admin_1.default />}/>
        </react_router_dom_1.Route>
      </react_router_dom_1.Routes>
    </>);
}
exports.default = App;
//# sourceMappingURL=App.js.map