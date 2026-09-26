import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getEvents, getMyEvents } from '../api';
import { useAuth } from '../lib/auth';
import { categoryStyle } from '../lib/categories';
import { spotsLeft } from '../lib/format';
import { getInterests } from '../lib/interests';
import EventCard from './EventCard';
import Icon from './Icon';
import Layout from './Layout';

const STEPS = [
  { title: 'Pick your causes', text: 'Tell us what you care about — the environment, education, health, animals and more.' },
  { title: 'Join an event', text: 'Browse upcoming opportunities near you and join in one click. No paperwork.' },
  { title: 'Show up and help', text: 'Meet the organizers and other volunteers, and make a real difference in your community.' },
];

const Stat = ({ value, label }) => (
  <div>
    <div className="text-3xl font-extrabold">{value}</div>
    <div className="text-sm text-violet-100">{label}</div>
  </div>
);

function CauseFilter({ categories, selected, onSelect }) {
  const chip = (active) =>
    `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition ${
      active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by cause">
      <button className={chip(!selected)} aria-pressed={!selected} onClick={() => onSelect(null)}>All causes</button>
      {categories.map((category) => (
        <button key={category.id} className={chip(selected === String(category.id))}
                aria-pressed={selected === String(category.id)} onClick={() => onSelect(String(category.id))}>
          <span aria-hidden="true">{categoryStyle(category.category).emoji}</span>{category.category}
        </button>
      ))}
    </div>
  );
}

const MainPage = () => {
  const { username } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goingIds, setGoingIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [cause, setCause] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getEvents()
      .then((page) => {
        setEvents(page?.content || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
    getCategories().then((list) => setCategories(list || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!username) {
      setGoingIds(new Set());
      return;
    }
    getMyEvents()
      .then((mine) => setGoingIds(new Set((mine?.joined || []).map((event) => event.id))))
      .catch(() => {});
  }, [username]);

  const interests = getInterests(username);
  const recommended = useMemo(
    () => events.filter((event) => interests.includes(String(event.category?.id)) && !goingIds.has(event.id)
      && spotsLeft(event) !== 0).slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, goingIds, interests.join()],
  );

  const query = search.trim().toLowerCase();
  const visibleEvents = events.filter((event) =>
    (!cause || String(event.category?.id) === cause)
    && (!query || [event.name, event.description, event.category?.category, event.address?.area, event.address?.pincode]
      .some((field) => field?.toLowerCase().includes(query))));

  const openSpots = events.reduce((sum, event) => sum + (spotsLeft(event) || 0), 0);
  const causesActive = new Set(events.map((event) => event.category?.id)).size;

  return (
    <Layout>
      <section className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <p className="text-violet-200 font-semibold mb-3">{username ? `Welcome back, ${username}` : 'Be a JoinTeer'}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl">Give your time where it matters most.</h1>
          <p className="mt-4 text-lg text-violet-100 max-w-2xl">
            JoinTeer connects volunteers with causes across Singapore — beach clean-ups, tutoring, blood drives,
            befriending seniors. Find something that fits your interests and schedule, and join in one click.
          </p>
          <label className="mt-8 flex items-center gap-3 bg-white rounded-xl shadow-lg px-4 py-3 max-w-xl">
            <Icon name="search" className="w-5 h-5 text-slate-400" />
            <span className="sr-only">Search events</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search by cause, place or event name"
                   className="flex-1 text-slate-900 placeholder-slate-400 focus:outline-none" />
          </label>
          {status === 'ready' && (
            <div className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
              <Stat value={events.length} label={events.length === 1 ? 'upcoming event' : 'upcoming events'} />
              <Stat value={openSpots} label="volunteer spots open" />
              <Stat value={causesActive} label={causesActive === 1 ? 'cause needs help' : 'causes need help'} />
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {username && interests.length === 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-violet-50 border border-violet-200 rounded-2xl p-5">
            <p className="text-violet-900"><span className="font-semibold">Get better suggestions.</span> Tell us which causes you care about.</p>
            <Link to="/interests" className="shrink-0 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-center">Choose causes</Link>
          </div>
        )}

        {recommended.length > 0 && !query && !cause && (
          <section aria-labelledby="picked-heading">
            <div className="flex items-baseline justify-between mb-4">
              <h2 id="picked-heading" className="text-2xl font-bold">Picked for you</h2>
              <Link to="/interests" className="text-sm text-violet-700 hover:underline">Edit your causes</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-2xl font-bold mb-4">Upcoming opportunities</h2>
          {categories.length > 0 && <div className="mb-6"><CauseFilter categories={categories} selected={cause} onSelect={setCause} /></div>}

          {status === 'loading' && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
              {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-2xl bg-slate-200 animate-pulse" />)}
            </div>
          )}
          {status === 'error' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="font-semibold">Couldn't load events right now.</p>
              <p className="text-sm text-slate-500 mt-1">Please check your connection and try again. (Developers: is the API gateway running?)</p>
            </div>
          )}
          {status === 'ready' && visibleEvents.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-2" aria-hidden="true">🌍</div>
              <p className="font-semibold">{query || cause ? 'No events match your search.' : 'No upcoming events yet.'}</p>
              <p className="text-sm text-slate-500 mt-1">
                {query || cause ? 'Try another cause or search term.' : 'Be the first to organize something good in your community.'}
              </p>
              {!query && !cause && (
                <Link to="/events/new" className="inline-block mt-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg">Post an event</Link>
              )}
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => <EventCard key={event.id} event={event} going={goingIds.has(event.id)} />)}
          </div>
        </section>

        {!username && (
          <section aria-labelledby="how-heading" className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10">
            <h2 id="how-heading" className="text-2xl font-bold mb-8 text-center">How JoinTeer works</h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-violet-100 text-violet-700 font-bold grid place-items-center mb-3">{index + 1}</div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.text}</p>
                </li>
              ))}
            </ol>
            <div className="text-center mt-8">
              <Link to="/register" className="inline-block font-semibold text-white bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl">Become a JoinTeer</Link>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Running a cause?</h2>
            <p className="text-slate-300 mt-1">Post an event and reach volunteers who already care about it.</p>
          </div>
          <Link to="/events/new" className="shrink-0 inline-flex items-center gap-2 font-semibold bg-white text-slate-900 hover:bg-violet-50 px-5 py-3 rounded-xl">
            <Icon name="plus" className="w-4 h-4" /> Post an event
          </Link>
        </section>
      </div>
    </Layout>
  );
}

export default MainPage;
