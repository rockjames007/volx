import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEvent, getMyEvents, joinEvent, leaveEvent } from '../api';
import { useAuth } from '../lib/auth';
import { categoryStyle } from '../lib/categories';
import { formatEventWhen, formatPlace, hasEnded, spotsLeft } from '../lib/format';
import { CategoryPill, SpotsBar } from './EventCard';
import Icon from './Icon';
import Layout from './Layout';

function JoinPanel({ event, going, onJoin, onLeave, busy, error }) {
  const { username } = useAuth();
  const location = useLocation();
  const ended = hasEnded(event);
  const full = spotsLeft(event) === 0;
  const isOrganizer = username && username === event.createdBy;

  let action;
  if (ended) {
    action = <p className="text-slate-600">This event has finished. Thank you to everyone who helped!</p>;
  } else if (isOrganizer) {
    action = <p className="text-slate-600">You're organizing this event.</p>;
  } else if (!username) {
    action = (
      <Link to="/login" state={{ from: location.pathname }}
            className="block text-center font-semibold text-white bg-violet-600 hover:bg-violet-700 px-5 py-3 rounded-xl">
        Log in to volunteer
      </Link>
    );
  } else if (going) {
    action = (
      <>
        <p className="flex items-center gap-2 font-semibold text-violet-700 mb-3"><Icon name="check" /> You're going!</p>
        <button onClick={onLeave} disabled={busy}
                className="w-full font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 px-5 py-2.5 rounded-xl disabled:opacity-50">
          {busy ? 'Updating…' : "I can't make it"}
        </button>
      </>
    );
  } else if (full) {
    action = <p className="text-slate-600">This event is full. Check back — spots open up when people cancel.</p>;
  } else {
    action = (
      <button onClick={onJoin} disabled={busy}
              className="w-full font-semibold text-white bg-violet-600 hover:bg-violet-700 px-5 py-3 rounded-xl disabled:opacity-50">
        {busy ? 'Signing you up…' : "I'll volunteer"}
      </button>
    );
  }

  return (
    <aside className="self-start bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
      <SpotsBar event={event} className="mb-5" />
      {action}
      {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}
    </aside>
  );
}

const EventDetailPage = () => {
  const { id } = useParams();
  const { username } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [going, setGoing] = useState(false);
  const [status, setStatus] = useState('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, [id]);

  useEffect(() => {
    if (!username) {
      setGoing(false);
      return;
    }
    getMyEvents()
      .then((mine) => setGoing((mine?.joined || []).some((joined) => String(joined.id) === String(id))))
      .catch(() => {});
  }, [id, username]);

  const update = async (action, nowGoing) => {
    setBusy(true);
    setError('');
    try {
      setEvent(await action(id));
      setGoing(nowGoing);
    } catch (err) {
      if (!localStorage.getItem('volx.token')) {
        navigate('/login', { state: { from: `/events/${id}` } });
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return <Layout><div className="max-w-5xl mx-auto px-4 py-16 text-slate-500">Loading event…</div></Layout>;
  }
  if (status === 'missing') {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">We couldn't find that event</h1>
          <p className="text-slate-600 mt-2">It may have been removed.</p>
          <Link to="/" className="inline-block mt-6 font-semibold text-violet-700 hover:underline">Browse upcoming events</Link>
        </div>
      </Layout>
    );
  }

  const style = categoryStyle(event.category?.category);
  const place = formatPlace(event.address);

  return (
    <Layout>
      <div className={`bg-gradient-to-r ${style.band}`}>
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 text-white">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white">
            <Icon name="arrowLeft" className="w-4 h-4" /> All events
          </Link>
          <div className="mt-6 text-5xl" aria-hidden="true">{style.emoji}</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">{event.name}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CategoryPill name={event.category?.category} />
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3"><Icon name="calendar" className="w-5 h-5 mt-0.5 text-slate-400" />{formatEventWhen(event.fromDate, event.toDate)}</li>
            {place && <li className="flex items-start gap-3"><Icon name="pin" className="w-5 h-5 mt-0.5 text-slate-400" />{place}</li>}
            {event.createdBy && <li className="flex items-start gap-3"><Icon name="user" className="w-5 h-5 mt-0.5 text-slate-400" />Organized by {event.createdBy}</li>}
            {event.noOfParticipant > 0 && <li className="flex items-start gap-3"><Icon name="users" className="w-5 h-5 mt-0.5 text-slate-400" />{event.noOfParticipant} volunteers needed</li>}
          </ul>
          <div>
            <h2 className="text-lg font-bold mb-2">About this event</h2>
            <p className="text-slate-700 whitespace-pre-line">{event.description || 'The organizer hasn\'t added a description yet.'}</p>
          </div>
        </div>
        <JoinPanel event={event} going={going} busy={busy} error={error}
                   onJoin={() => update(joinEvent, true)} onLeave={() => update(leaveEvent, false)} />
      </div>
    </Layout>
  );
};

export default EventDetailPage;
