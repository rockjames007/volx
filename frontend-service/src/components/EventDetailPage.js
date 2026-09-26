import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cancelEvent, getEvent, getMyEvents, getToken, getVolunteers, joinEvent, leaveEvent } from '../api';
import { useAuth } from '../lib/auth';
import { categoryStyle } from '../lib/categories';
import { formatEventWhen, formatPlace, hasEnded, spotsLeft } from '../lib/format';
import { CategoryPill, SpotsBar } from './EventCard';
import Icon from './Icon';
import Layout from './Layout';

const formatJoined = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

// The event's own organizer: who's coming, and edit / cancel.
function OrganizerPanel({ event, onCancelled }) {
  const [volunteers, setVolunteers] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancelled = event.isActive === false;

  useEffect(() => {
    getVolunteers(event.id).then(setVolunteers).catch((err) => setError(err.message));
  }, [event.id, event.volunteersJoined]);

  const handleCancel = async () => {
    setBusy(true);
    setError('');
    try {
      onCancelled(await cancelEvent(event.id));
      setConfirming(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="self-start bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24 space-y-5">
      <p className="text-sm font-semibold text-violet-700">You're organizing this event</p>
      <SpotsBar event={event} />

      <div>
        <h2 className="font-bold mb-2">Volunteers{volunteers ? ` (${volunteers.length})` : ''}</h2>
        {!volunteers && !error && <p className="text-sm text-slate-500">Loading…</p>}
        {volunteers && volunteers.length === 0 && <p className="text-sm text-slate-500">No one has joined yet.</p>}
        {volunteers && volunteers.length > 0 && (
          <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto" aria-label="Volunteers who joined">
            {volunteers.map((v) => (
              <li key={v.username} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium truncate">{v.name}</span>
                  <span className="block text-xs text-slate-500">@{v.username}</span>
                </span>
                <span className="text-xs text-slate-500 shrink-0">Joined {formatJoined(v.joinedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!cancelled && !hasEnded(event) && (
        confirming ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm text-red-800">Cancel this event? It will disappear from the listing, and volunteers who joined will see that it's cancelled.</p>
            <div className="flex gap-2">
              <button onClick={handleCancel} disabled={busy}
                      className="flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg disabled:opacity-50">
                {busy ? 'Cancelling…' : 'Yes, cancel event'}
              </button>
              <button onClick={() => setConfirming(false)} className="flex-1 text-sm font-medium border border-slate-300 bg-white px-3 py-2 rounded-lg">Keep it</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to={`/events/${event.id}/attendance`} className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-700 border border-violet-200 hover:bg-violet-50 px-3 py-2.5 rounded-xl">
              Attendance &amp; check-in QR
            </Link>
            <div className="flex gap-2">
              <Link to={`/events/${event.id}/edit`} className="flex-1 text-center text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-2.5 rounded-xl">Edit event</Link>
              <button onClick={() => setConfirming(true)} className="flex-1 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 px-3 py-2.5 rounded-xl">Cancel event</button>
            </div>
          </div>
        )
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </aside>
  );
}

function JoinPanel({ event, going, onJoin, onLeave, busy, error }) {
  const { username } = useAuth();
  const location = useLocation();
  const ended = hasEnded(event);
  const full = spotsLeft(event) === 0;

  let action;
  if (event.isActive === false) {
    action = <p className="text-slate-600">This event was cancelled by the organizer.{going ? " You don't need to do anything." : ''}</p>;
  } else if (ended) {
    action = <p className="text-slate-600">This event has finished. Thank you to everyone who helped!</p>;
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
        <p className="flex items-center gap-2 font-semibold text-violet-700 mb-3"><Icon name="check" className="w-5 h-5 shrink-0" /> You're going! Thanks for being a JoinTeer.</p>
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
        {busy ? 'Joining…' : 'Join as a volunteer'}
      </button>
    );
  }

  return (
    <aside className="self-start bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
      {event.isActive !== false && <SpotsBar event={event} className="mb-5" />}
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
      if (!getToken()) {
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
  const isOwner = Boolean(username) && username === event.createdBy;
  const cancelled = event.isActive === false;

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
      {cancelled && (
        <div className="bg-red-50 border-b border-red-200 text-red-800" role="status">
          <p className="max-w-5xl mx-auto px-4 py-3 text-sm font-semibold">This event has been cancelled.</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CategoryPill name={event.category?.category} />
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3"><Icon name="calendar" className="w-5 h-5 mt-0.5 text-slate-400" />{formatEventWhen(event.fromDate, event.toDate)}</li>
            {place && <li className="flex items-start gap-3"><Icon name="pin" className="w-5 h-5 mt-0.5 text-slate-400" />{place}</li>}
            {event.createdBy && <li className="flex items-start gap-3"><Icon name="user" className="w-5 h-5 mt-0.5 text-slate-400" />Organized by {event.organizerName || event.createdBy}</li>}
            {event.noOfParticipant > 0 && <li className="flex items-start gap-3"><Icon name="users" className="w-5 h-5 mt-0.5 text-slate-400" />{event.noOfParticipant} volunteers needed</li>}
          </ul>
          <div>
            <h2 className="text-lg font-bold mb-2">About this event</h2>
            <p className="text-slate-700 whitespace-pre-line">{event.description || 'The organizer hasn\'t added a description yet.'}</p>
          </div>
        </div>
        {isOwner ? (
          <OrganizerPanel event={event} onCancelled={setEvent} />
        ) : (
          <JoinPanel event={event} going={going} busy={busy} error={error}
                     onJoin={() => update(joinEvent, true)} onLeave={() => update(leaveEvent, false)} />
        )}
      </div>
    </Layout>
  );
};

export default EventDetailPage;
