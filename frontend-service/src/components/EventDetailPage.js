import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cancelEvent, getEvent, getMyEvents, getToken, getVolunteers, joinEvent, leaveEvent } from '../api';
import { useAuth } from '../lib/auth';
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
    <aside className="self-start bg-white border border-sand-200 rounded-xl p-6 shadow-sm lg:sticky lg:top-24 space-y-5">
      <p className="text-sm font-semibold text-sambal-700">You're organizing this event</p>
      <SpotsBar event={event} />

      <div>
        <h2 className="font-bold mb-2">Volunteers{volunteers ? ` (${volunteers.length})` : ''}</h2>
        {!volunteers && !error && <p className="text-sm text-kopi-600">Loading…</p>}
        {volunteers && volunteers.length === 0 && <p className="text-sm text-kopi-600">No one has joined yet.</p>}
        {volunteers && volunteers.length > 0 && (
          <ul className="divide-y divide-sand-100 max-h-72 overflow-y-auto" aria-label="Volunteers who joined">
            {volunteers.map((v) => (
              <li key={v.username} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium truncate">{v.name}</span>
                  <span className="block text-sm text-kopi-600">@{v.username}</span>
                </span>
                <span className="text-sm text-kopi-600 shrink-0">Joined {formatJoined(v.joinedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!cancelled && !hasEnded(event) && (
        confirming ? (
          <div className="rounded-xl border border-chilli-100 bg-chilli-50 p-4 space-y-3">
            <p className="text-sm text-chilli-800">Cancel this event? It will disappear from the listing, and volunteers who joined will see that it's cancelled.</p>
            <div className="flex gap-2">
              <button onClick={handleCancel} disabled={busy}
                      className="flex-1 text-sm font-semibold text-white bg-chilli-700 hover:bg-chilli-800 px-3 py-2 rounded-lg disabled:opacity-50">
                {busy ? 'Cancelling…' : 'Yes, cancel event'}
              </button>
              <button onClick={() => setConfirming(false)} className="flex-1 text-sm font-medium border border-sand-300 bg-white px-3 py-2 rounded-lg">Keep it</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to={`/events/${event.id}/attendance`} className="flex items-center justify-center gap-2 text-sm font-semibold text-sambal-700 border border-sambal-200 hover:bg-sambal-50 px-3 py-2.5 rounded-xl">
              Attendance &amp; check-in QR
            </Link>
            <div className="flex gap-2">
              <Link to={`/events/${event.id}/edit`} className="flex-1 text-center text-sm font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-3 py-2.5 rounded-xl">Edit event</Link>
              <button onClick={() => setConfirming(true)} className="flex-1 text-sm font-medium text-chilli-700 border border-chilli-100 hover:bg-chilli-50 px-3 py-2.5 rounded-xl">Cancel event</button>
            </div>
          </div>
        )
      )}
      {error && <p role="alert" className="text-sm text-chilli-700">{error}</p>}
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
    action = <p className="text-kopi-700">This event was cancelled by the organizer.{going ? " You don't need to do anything." : ''}</p>;
  } else if (ended) {
    action = <p className="text-kopi-700">This event has finished. Thank you to everyone who helped!</p>;
  } else if (!username) {
    action = (
      <Link to="/login" state={{ from: location.pathname }}
            className="block text-center font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-5 py-3 rounded-xl">
        Log in to volunteer
      </Link>
    );
  } else if (going) {
    action = (
      <>
        <p className="flex items-center gap-2 font-semibold text-pandan-700 mb-3"><Icon name="check" className="w-5 h-5 shrink-0" weight="bold" /> You're in. See you there.</p>
        <button onClick={onLeave} disabled={busy}
                className="w-full font-medium text-kopi-800 border border-sand-300 hover:bg-sand-100 px-5 py-2.5 rounded-xl disabled:opacity-50">
          {busy ? 'Updating…' : "I can't make it"}
        </button>
      </>
    );
  } else if (full) {
    action = <p className="text-kopi-700">This event is full. Check back — spots open up when people cancel.</p>;
  } else {
    action = (
      <button onClick={onJoin} disabled={busy}
              className="w-full font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-5 py-3 rounded-xl disabled:opacity-50">
        {busy ? 'Joining…' : 'Join as a volunteer'}
      </button>
    );
  }

  return (
    <aside className="self-start bg-white border border-sand-200 rounded-xl p-6 shadow-sm lg:sticky lg:top-24">
      {event.isActive !== false && <SpotsBar event={event} className="mb-5" />}
      {action}
      {error && <p role="alert" className="text-sm text-chilli-700 mt-3">{error}</p>}
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
    return <Layout><div className="max-w-5xl mx-auto px-4 py-16 text-kopi-600">Loading event…</div></Layout>;
  }
  if (status === 'missing') {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">We couldn't find that event</h1>
          <p className="text-kopi-700 mt-2">It may have been removed.</p>
          <Link to="/" className="inline-block mt-6 font-semibold text-sambal-700 hover:underline">Browse upcoming events</Link>
        </div>
      </Layout>
    );
  }

  const place = formatPlace(event.address);
  const isOwner = Boolean(username) && username === event.createdBy;
  const cancelled = event.isActive === false;

  return (
    <Layout>
      <div className="border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-kopi-700 hover:text-kopi-900">
            <Icon name="arrowLeft" className="w-4 h-4" /> All events
          </Link>
          <div className="mt-6"><CategoryPill name={event.category?.category} /></div>
          <h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-tight">{event.name}</h1>
          <p className="mt-3 text-lg text-kopi-700">{formatEventWhen(event.fromDate, event.toDate)}{place ? ` · ${place}` : ''}</p>
        </div>
      </div>
      {cancelled && (
        <div className="bg-chilli-50 border-b border-chilli-100 text-chilli-800" role="status">
          <p className="max-w-5xl mx-auto px-4 py-3 font-semibold">This event has been cancelled.</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <ul className="space-y-3 text-kopi-800">
            {event.createdBy && <li className="flex items-start gap-3"><Icon name="user" className="w-5 h-5 mt-0.5 text-kopi-600" />Organized by {event.organizerName || event.createdBy}</li>}
            {event.noOfParticipant > 0 && <li className="flex items-start gap-3"><Icon name="users" className="w-5 h-5 mt-0.5 text-kopi-600" />{event.noOfParticipant} volunteers needed</li>}
          </ul>
          <div>
            <h2 className="text-2xl font-semibold mb-3">About this event</h2>
            <p className="text-kopi-800 whitespace-pre-line">{event.description || 'The organizer hasn\'t added a description yet.'}</p>
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
