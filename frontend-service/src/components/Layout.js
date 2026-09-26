import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Icon from './Icon';

export const Logo = ({ light = false }) => (
  <Link to="/" className="flex items-center gap-2" aria-label="JoinTeer home">
    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white font-extrabold grid place-items-center shadow-sm" aria-hidden="true">J</span>
    {/* Two-tone wordmark so it reads "Join" + "Teer" (as in volunteer). */}
    <span className="text-xl font-extrabold tracking-tight">
      <span className={light ? 'text-white' : 'text-slate-900'}>Join</span>
      <span className={light ? 'text-violet-200' : 'text-violet-600'}>Teer</span>
    </span>
  </Link>
);

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-violet-700 bg-violet-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`;

function Header() {
  const { username, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setOpen(false);
    navigate('/');
  };

  const links = (
    <>
      <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>Explore</NavLink>
      {username && <NavLink to="/me" className={navClass} onClick={() => setOpen(false)}>My events</NavLink>}
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">{links}</nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/events/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900 px-3 py-2">
            <Icon name="plus" className="w-4 h-4" /> Post an event
          </Link>
          {username ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold grid place-items-center uppercase" aria-hidden="true">{username[0]}</span>
              <span className="text-sm font-medium text-slate-700">{username}</span>
              <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-900">Log out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2">Log in</Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg shadow-sm">Sign up</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 -mr-2 text-slate-700" onClick={() => setOpen(!open)}
                aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          <Icon name={open ? 'close' : 'menu'} className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
          {links}
          <NavLink to="/events/new" className={navClass} onClick={() => setOpen(false)}>Post an event</NavLink>
          {username ? (
            <button onClick={handleLogout} className="text-left px-3 py-2 text-sm text-slate-600">Log out ({username})</button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-medium border border-slate-300 rounded-lg py-2">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-semibold text-white bg-violet-600 rounded-lg py-2">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const Footer = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-2 justify-between text-sm text-slate-500">
      <span>JoinTeer — join in, volunteer, and help causes across Singapore.</span>
      <span>Every hour you give counts.</span>
    </div>
  </footer>
);

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
