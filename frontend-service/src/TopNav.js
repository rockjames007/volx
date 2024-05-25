import React from 'react';
import './TopNav.css';
import './index.js'; 

const TopNav = () => {
  return (
    <nav className="topnav">
      <div className="logo">
        <a href="/">VolX</a>
      </div>
      <div className="nav-links">
        <a href="/">Events</a>
        <a href="/events">Create Events</a>
        <a href="/login">Login</a>
        <a href="/profile">Profile</a>
      </div>
    </nav>  
  );
};

export default TopNav;