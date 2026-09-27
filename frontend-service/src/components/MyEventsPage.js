import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getMyEvents } from '../api';
import { useAuth } from '../lib/auth';
import { hasEnded } from '../lib/format';
import EventCard from './EventCard';
import Layout from './Layout';

const TABS = [
  { key: 'joined', label: 'Going', empty: "You haven't signed up for anything yet.", cta: 'Find an event', to: '/' },
  { key: 'organizing', label: 'Organizing', empty: "You aren't organizing any events.", cta: 'Post an event', to: '/events/new' },
];

const MyEventsPage = () => {
  const { username, isOrganizer } = useAuth();
  const [mine, setMine] = useState(null);
  const [tab, setTab] = useState(isOrganizer ? 'organizing' : 'joined');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    getMyEvents().then(setMine).catch((err) => setError(err.message));
  }, [username]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: '/me' }} />;
  }

  // Volunteer accounts can't organize, so they only get the "Going" list.
  const tabs = isOrganizer ? TABS : TABS.filter((t) => t.key === 'joined');
  const current = tabs.find((t) => t.key === tab) || tabs[0];
  const events = mine?.[current.key] || [];
  const upcoming = events.filter((event) => !hasEnded(event));
  const past = events.filter(hasEnded);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">My events</h1>
        {mine && (
          <p className="text-kopi-700 mt-1">
            {isOrganizer
              ? `You're organizing ${mine.organizing.length} ${mine.organizing.length === 1 ? 'event' : 'events'}.`
              : `You've signed up for ${mine.joined.length} ${mine.joined.length === 1 ? 'event' : 'events'}.`}
          </p>
        )}

        <div className="mt-6 border-b border-sand-200 flex gap-6" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={current.key === t.key} onClick={() => setTab(t.key)}
                    className={`pb-3 -mb-px text-sm font-semibold border-b-2 ${current.key === t.key ? 'border-sambal-700 text-sambal-700' : 'border-transparent text-kopi-600 hover:text-kopi-900'}`}>
              {t.label}{mine ? ` (${mine[t.key].length})` : ''}
            </button>
          ))}
        </div>

        <div className="py-6" role="tabpanel">
          {error && <p role="alert" className="text-chilli-700">{error}</p>}
          {!mine && !error && <p className="text-kopi-600">Loading…</p>}
          {mine && events.length === 0 && (
            <div className="bg-white border border-dashed border-sand-300 rounded-xl p-10 text-center">
              <p className="font-semibold">{current.empty}</p>
              <Link to={current.to} className="inline-block mt-4 text-sm font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-4 py-2 rounded-lg">{current.cta}</Link>
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => <EventCard key={event.id} event={event} going={current.key === 'joined'} />)}
            </div>
          )}
          {past.length > 0 && (
            <>
              <h2 className="text-lg font-bold mt-10 mb-4 text-kopi-600">Past</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-75">
                {past.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyEventsPage;
