import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getEvents, getUsername } from '../api';
import './MainPage.css';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const EventCard = ({ event }) => (
  <div className="blue-card">
    <div className="rounded-lg shadow-md p-4 flex flex-col h-full bg-blue-200">
      {event.bgImage?.base64 && (
        <img src={`data:image/png;base64,${event.bgImage.base64}`} alt="" className="w-full h-32 object-cover rounded mb-2" />
      )}
      <div className="font-bold text-lg">{event.name}</div>
      {event.category?.category && <div className="text-xs uppercase text-purple-700">{event.category.category}</div>}
      <div className="text-sm text-gray-700 mt-1">{formatDate(event.fromDate)}{event.toDate ? ` – ${formatDate(event.toDate)}` : ''}</div>
      {event.address?.area && <div className="text-sm text-gray-700">{event.address.area}</div>}
      {event.noOfParticipant > 0 && <div className="text-sm text-gray-700">{event.noOfParticipant} volunteers needed</div>}
      {event.description && <p className="text-sm mt-2">{event.description}</p>}
    </div>
  </div>
);

const MainPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(getUsername());
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getEvents()
      .then((page) => {
        setEvents(page?.content || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const handleLogout = () => {
    clearSession();
    setUsername(null);
    navigate('/');
  };

  const query = search.trim().toLowerCase();
  const visibleEvents = events.filter((event) =>
    !query || [event.name, event.description, event.category?.category, event.address?.area]
      .some((field) => field?.toLowerCase().includes(query)));

  return (
    <div className="bg-purple-500 min-h-screen flex flex-col">
      <div className="header">
        <div className="logo">Volx</div>
        <div className="nav-links">
          {username ? (
            <>
              <Link to="/events/new" className="text-white font-bold mr-4">Create event</Link>
              <span className="text-white mr-4">Hi, {username}</span>
              <button onClick={handleLogout} className="text-white hover:underline">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white">Login</Link>
              <Link to="/register" className="text-white">Register</Link>
            </>
          )}
        </div>
      </div>
      <div className="content">
        <div className="bg-white rounded-lg p-8 mt-8 mx-auto w-11/12 md:w-2/3">
          <div className="purple-card">
            <h2 className="text-3xl font-bold mb-4 text-white">Be a volunteer</h2>
            <input type="text" placeholder="Search events by name, category or area" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-8 mt-8 mb-8 mx-auto w-11/12 md:w-2/3">
          <h3 className="text-2xl font-bold mb-4">Upcoming events</h3>
          {status === 'loading' && <p>Loading events…</p>}
          {status === 'error' && <p>Couldn't load events. Make sure the API gateway and profile service are running.</p>}
          {status === 'ready' && visibleEvents.length === 0 && (
            <p>
              {query ? 'No events match your search.' : 'No upcoming events yet.'}
              {!query && username && <> <Link to="/events/new" className="text-purple-600 underline">Create the first one</Link>.</>}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
