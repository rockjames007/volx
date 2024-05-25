import React from 'react';
import './TopNav.css';

const TopNav = () => {
  return (
    <div className="min-h-screen">
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
    </nav></div>
  );
};

export default TopNav;