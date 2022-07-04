import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { useGetProfile } from "./api/auth";
import { useEffect } from "react";
import Profile from "./pages/Profile";
import AppHeader from "./components/AppHeader";
import Layout from "./components/Layout";
import LeaderBoard from "./pages/LeaderBoard";
import Settings from "./pages/Settings";
import { TwoFactorAuth } from "./components/TwoFactorAuth";
import Cookies from "js-cookie";
import Admin from "./pages/Admin";
import UserProfile from "./pages/UserProfile";
import Pong from "./pages/Pong";

function App() {
  const { status, data: user } = useGetProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (status == "error") {
      navigate("/login");
    } else if (status == "success") {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("jwt_token", Cookies.get("jwt_token")!);
    }
  }, [status]);

  return (
    <>
      {status == "success" ? <AppHeader /> : null}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user_profile/:id" element={<UserProfile />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pong" element={<Pong />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
