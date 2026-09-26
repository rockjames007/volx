import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarBlank, MagnifyingGlass, Plus, SealCheck } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';

// Text wordmark until the designed logo is ready: "Join" in Kopi, "Teer" in Sambal.
export const Logo = ({ light = false }) => (
  <Link to="/" className="font-display text-2xl font-semibold tracking-tight leading-none" aria-label="JoinTeer home">
    <span className={light ? 'text-rice-50' : 'text-kopi-900'}>Join</span>
    <span className={light ? 'text-kaya-300' : 'text-sambal-700'}>Teer</span>
  </Link>
);

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg font-semibold ${isActive ? 'text-sambal-700 bg-sambal-50' : 'text-kopi-700 hover:text-kopi-900 hover:bg-sand-100'}`;

// The few places a person needs, by account type (see "Navigation" in the brand guide).
function useDestinations() {
  const { username, isOrganizer } = useAuth();
  if (!username) return [{ to: '/', label: 'Find events', Icon: MagnifyingGlass, end: true }];
  if (isOrganizer) {
    return [
      { to: '/me', label: 'My events', Icon: CalendarBlank, end: true },
      { to: '/events/new', label: 'Post', Icon: Plus },
      { to: '/', label: 'Find events', Icon: MagnifyingGlass, end: true },
    ];
  }
  return [
    { to: '/', label: 'Find events', Icon: MagnifyingGlass, end: true },
    { to: '/me', label: 'My events', Icon: CalendarBlank, end: true },
    { to: '/me/hours', label: 'My hours', Icon: SealCheck },
  ];
}

function AccountMenu() {
  const { username, isOrganizer, organizationName, fullName, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-sand-100">
        <span className="w-9 h-9 rounded-full bg-kaya-200 text-kopi-900 font-bold grid place-items-center uppercase" aria-hidden="true">{username[0]}</span>
        <span className="hidden sm:block text-left leading-tight">
          <span className="block font-semibold text-kopi-900">{fullName || username}</span>
          {isOrganizer && organizationName && <span className="block text-sm text-kopi-600">{organizationName}</span>}
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-sand-200 bg-white shadow-lg p-2 z-30">
          <p className="px-3 py-2 text-sm text-kopi-600">Signed in as @{username}</p>
          <button role="menuitem" onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg font-semibold text-kopi-900 hover:bg-sand-100">Log out</button>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { username, isOrganizer } = useAuth();
  const destinations = useDestinations();

  return (
    <header className="sticky top-0 z-20 bg-rice-50/95 backdrop-blur border-b border-sand-200 print:hidden">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {destinations.filter((d) => d.to !== '/events/new').map((d) => (
              <NavLink key={d.to} to={d.to} end={d.end} className={navClass}>{d.label}</NavLink>
            ))}
            {!username && <NavLink to="/register?type=organizer" className={navClass}>For organizers</NavLink>}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isOrganizer && (
            <Link to="/events/new" className="hidden md:inline-flex items-center gap-2 font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-4 h-11 rounded-xl">
              <Plus className="w-5 h-5" weight="bold" aria-hidden="true" /> Post an event
            </Link>
          )}
          {username ? (
            <AccountMenu />
          ) : (
            <>
              <Link to="/login" className="font-semibold text-kopi-900 hover:bg-sand-100 px-3 h-11 inline-flex items-center rounded-xl">Log in</Link>
              <Link to="/register" className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-4 h-11 inline-flex items-center rounded-xl">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Phone navigation for logged-in people: the main destinations, always one tap away.
function TabBar() {
  const { username } = useAuth();
  const destinations = useDestinations();
  if (!username) return null;
  return (
    <nav aria-label="Main" className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-sand-200 print:hidden">
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${destinations.length}, minmax(0, 1fr))` }}>
        {destinations.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}
                     className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-sm font-semibold ${isActive ? 'text-sambal-700' : 'text-kopi-600'}`}>
              {({ isActive }) => (
                <>
                  <Icon className="w-6 h-6" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const Footer = () => (
  <footer className="bg-kopi-900 text-rice-100 print:hidden">
    <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6 sm:grid-cols-3">
      <div>
        <Logo light />
        <p className="mt-3 text-sm text-kopi-300">Join in and volunteer for causes across Singapore.</p>
      </div>
      <div className="text-sm">
        <p className="font-semibold text-rice-50">Volunteers</p>
        <ul className="mt-2 space-y-1.5 text-kopi-300">
          <li><Link to="/" className="hover:text-rice-50">Find events</Link></li>
          <li><Link to="/me/hours" className="hover:text-rice-50">My verified hours</Link></li>
        </ul>
      </div>
      <div className="text-sm">
        <p className="font-semibold text-rice-50">Organizers</p>
        <ul className="mt-2 space-y-1.5 text-kopi-300">
          <li><Link to="/register?type=organizer" className="hover:text-rice-50">Post your events</Link></li>
          <li><Link to="/me" className="hover:text-rice-50">Manage attendance</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);

const Layout = ({ children }) => {
  const { username } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 ${username ? 'pb-20 md:pb-0' : ''}`}>{children}</main>
      <Footer />
      <TabBar />
    </div>
  );
};

export default Layout;
