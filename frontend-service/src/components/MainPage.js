import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getEvents, getMyEvents } from '../api';
import { useAuth } from '../lib/auth';
import { CauseIcon } from '../lib/categories';
import { spotsLeft } from '../lib/format';
import { getInterests } from '../lib/interests';
import EventCard from './EventCard';
import Icon from './Icon';
import Layout from './Layout';

const firstName = (name) => (name ? name.trim().split(/\s+/)[0] : null);

// "What do you care about?": one tap filters the list to a cause.
function CausePicker({ categories, selected, onSelect }) {
  const chip = (active) =>
    `inline-flex items-center gap-2 h-11 px-4 rounded-full border font-semibold transition ${
      active ? 'bg-sambal-100 border-sambal-700 text-sambal-800' : 'bg-white border-sand-300 text-kopi-800 hover:border-kopi-600'}`;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="What do you care about?">
      {categories.map((category) => {
        const id = String(category.id);
        const active = selected === id;
        return (
          <button key={id} className={chip(active)} aria-pressed={active} onClick={() => onSelect(active ? null : id)}>
            <CauseIcon name={category.category} className="w-5 h-5" />
            {category.category}
          </button>
        );
      })}
    </div>
  );
}

const MainPage = () => {
  const { username, isOrganizer, fullName } = useAuth();
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
  const filtering = Boolean(query || cause);
  const visibleEvents = events.filter((event) =>
    (!cause || String(event.category?.id) === cause)
    && (!query || [event.name, event.description, event.category?.category, event.address?.area, event.address?.pincode]
      .some((field) => field?.toLowerCase().includes(query))));
  const openSpots = events.reduce((sum, event) => sum + (spotsLeft(event) || 0), 0);
  const name = firstName(fullName) || username;

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 md:pt-20 md:pb-14">
        <p className="font-semibold text-sambal-700">{username ? `Hi ${name},` : 'Hello, neighbour.'}</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-semibold text-kopi-900 max-w-3xl leading-[1.08]">
          Got a few hours{' '}
          <span className="relative whitespace-nowrap">
            this weekend?
            {/* The brand's one hand-drawn motif: a Kaya underline under the key words. */}
            <svg className="absolute left-0 -bottom-2 w-full h-3 text-kaya-400" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9 C 60 3, 140 2, 298 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-kopi-700 max-w-2xl">
          Pick something good to do near you in Singapore. Join in one tap, and your hours are recorded for you.
        </p>

        <div className="mt-8 space-y-4">
          <p className="font-semibold text-kopi-900">What do you care about?</p>
          {categories.length > 0 && <CausePicker categories={categories} selected={cause} onSelect={setCause} />}
          <label className="flex items-center gap-3 bg-white border border-sand-300 rounded-xl px-4 h-12 max-w-xl focus-within:border-sambal-700">
            <Icon name="search" className="w-5 h-5 text-kopi-600" />
            <span className="sr-only">Search events</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Or search a place, e.g. Tampines"
                   className="flex-1 bg-transparent text-kopi-900 placeholder-kopi-600 focus:outline-none" />
          </label>
        </div>
      </section>

      <div className="border-t border-sand-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
          {recommended.length > 0 && !filtering && (
            <section aria-labelledby="picked-heading">
              <div className="flex items-baseline justify-between gap-4 mb-5">
                <h2 id="picked-heading" className="text-2xl md:text-3xl font-semibold">Picked for you</h2>
                <Link to="/interests" className="font-semibold text-sambal-700 hover:underline">Change your causes</Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </section>
          )}

          <section aria-labelledby="upcoming-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <h2 id="upcoming-heading" className="text-2xl md:text-3xl font-semibold">
                {filtering ? 'Matching events' : 'Happening soon'}
              </h2>
              {status === 'ready' && events.length > 0 && !filtering && (
                <p className="text-kopi-600">
                  {events.length} {events.length === 1 ? 'event' : 'events'} · {openSpots} volunteer spots open
                </p>
              )}
            </div>

            {status === 'loading' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
                {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-sand-100 animate-pulse" />)}
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-xl border border-sand-200 bg-rice-50 p-8 text-center">
                <p className="font-semibold">We can't load events right now.</p>
                <p className="text-kopi-600 mt-1">Please try again in a minute.</p>
              </div>
            )}
            {status === 'ready' && visibleEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-sand-300 bg-rice-50 p-10 text-center">
                <p className="font-semibold">{filtering ? 'No events match that yet.' : 'No upcoming events yet.'}</p>
                <p className="text-kopi-600 mt-1">
                  {filtering ? 'Try another cause or place.' : 'New events are added every week, so check back soon.'}
                </p>
                {!filtering && isOrganizer && (
                  <Link to="/events/new" className="inline-flex items-center mt-4 font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-4 h-11 rounded-xl">Post an event</Link>
                )}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => <EventCard key={event.id} event={event} going={goingIds.has(event.id)} />)}
            </div>
          </section>

          {username && interests.length === 0 && !isOrganizer && (
            <p className="text-kopi-700">
              Want suggestions that fit you? <Link to="/interests" className="font-semibold text-sambal-700 hover:underline">Tell us what you care about</Link>.
            </p>
          )}
          {!username && (
            <p className="text-kopi-700">
              Running a charity, school or community group? <Link to="/register?type=organizer" className="font-semibold text-sambal-700 hover:underline">Post your events on JoinTeer</Link>.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MainPage;
