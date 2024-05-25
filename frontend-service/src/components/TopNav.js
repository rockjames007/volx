import React from 'react';
import './TopNav.css';
import '../index.js'; 

const TopNav = () => {
  return (
    <nav className="topnav">
      <div className="logo">
        <a href="/">Volx</a>
      </div>
      <div className="nav-links">
        <a href="/home">Home</a>
        <a href="/events">Find/Create Events</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    </nav>
  );
};

export default TopNav;