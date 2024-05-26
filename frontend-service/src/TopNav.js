import React from 'react';
import './TopNav.css';
import './index.js';
import { Link } from "react-router-dom";
import { useRecoilState } from 'recoil';
import { userState } from './state/recoilstate.js';
const TopNav = () => {
  const [user, setUser] = useRecoilState(userState);
  const handleLogout = () => {
    setUser({ ...user, isLoggedIn: false });
  };

  return (
    <nav className="topnav">
      <div className="logo">
        <Link to="/">VolX</Link>
      </div>
      <div className="nav-links">
        {user.isOrg && (<Link to="/events">Create Events</Link>)}
        {user.isLoggedIn && !user.isOrg && (<Link to="/volunteer">Volunteer</Link>)}
        {user.isLoggedIn && (<Link to="/profile">Profile</Link>)}
        {!user.isLoggedIn && (<Link to="/login">Login</Link>)}
        {user.isLoggedIn && (<Link to="/" onClick={handleLogout}>Logout</Link>)}
      </div>
    </nav>
  );
};

export default TopNav;