import React from 'react';
import './TopNav.css';
import './index.js'; 
import { Link } from "react-router-dom"
const TopNav = () => {
  return (
    <nav className="topnav">
      <div className="logo">
        <Link to="/">VolX</Link>
      </div>
      <div className="nav-links">
        <Link to="/events">Create Events</Link>
        <Link to="/login">Login</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default TopNav;