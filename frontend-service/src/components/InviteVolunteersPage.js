import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { findVolunteers, getCategories, getEvent, inviteVolunteers } from '../api';
import { useAuth } from '../lib/auth';
import { formatEventWhen, formatPlace, hasEnded, spotsLeft } from '../lib/format';
import Icon from './Icon';
import Layout from './Layout';

const fieldClass = 'h-11 px-3 rounded-lg border border-sand-300 bg-white text-kopi-900 placeholder-kopi-600 focus:border-sambal-700 focus:outline-none';

const STATUS_LABELS = {
  JOINED: { text: 'Going', className: 'bg-pandan-50 text-pandan-800' },
  INVITED: { text: 'Invited', className: 'bg-kaya-100 text-kopi-900' },
  DECLINED: { text: "Can't make it", className: 'bg-sand-100 text-kopi-700' },
  LEFT: { text: 'Left the event', className: 'bg-sand-100 text-kopi-700' },
};

const hoursLabel = (hours) => `${Number.isInteger(hours) ? hours : hours.toFixed(1)} verified ${hours === 1 ? 'hour' : 'hours'}`;

function VolunteerRow({ volunteer, causeName, checked, onToggle }) {
  const status = STATUS_LABELS[volunteer.status];
  const id = `pick-${volunteer.username}`;
  return (
    <li className="flex items-start gap-3 py-4">
      <input id={id} type="checkbox" checked={checked} onChange={onToggle} disabled={Boolean(status)}
             className="mt-1 w-5 h-5 accent-sambal-700 shrink-0 disabled:opacity-40" />
      <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-kopi-900">{volunteer.name}</span>
          {volunteer.area && <span className="text-sm text-kopi-600">· {volunteer.area}</span>}
          {status && <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${status.className}`}>{status.text}</span>}
        </span>
        <span className="block text-sm text-kopi-700 mt-1">
          {volunteer.eventsAttended > 0
            ? `${hoursLabel(volunteer.verifiedHours)} · ${volunteer.eventsAttended} ${volunteer.eventsAttended === 1 ? 'event' : 'events'}`
            : 'New to volunteering on JoinTeer'}
          {volunteer.interests.length > 0 && ` · Cares about ${volunteer.interests.join(', ')}`}
        </span>
        {(volunteer.eventsWithYou > 0 || (causeName && volunteer.causeEvents > 0)) && (
          <span className="flex flex-wrap gap-2 mt-2">
            {volunteer.eventsWithYou > 0 && (
              <span className="text-sm font-semibold text-sambal-800 bg-sambal-50 px-2 py-0.5 rounded-full">
                Helped you {volunteer.eventsWithYou === 1 ? 'once' : `${volunteer.eventsWithYou} times`}
              </span>
            )}
            {causeName && volunteer.causeEvents > 0 && (
              <span className="text-sm font-semibold text-pandan-800 bg-pandan-50 px-2 py-0.5 rounded-full">
                {volunteer.causeEvents} {causeName} {volunteer.causeEvents === 1 ? 'event' : 'events'}
              </span>
            )}
          </span>
        )}
      </label>
    </li>
  );
}

// Organizers: find volunteers who opted in to invitations, filtered by cause, area and experience, and invite them.
const InviteVolunteersPage = () => {
  const { id } = useParams();
  const { username, isOrganizer } = useAuth();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [area, setArea] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [experienced, setExperienced] = useState(false);
  const [volunteers, setVolunteers] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    getCategories().then((list) => setCategories(list || [])).catch(() => {});
    getEvent(id)
      .then((loaded) => {
        setEvent(loaded);
        setCategoryId(loaded.category?.id ? String(loaded.category.id) : '');
        setMessage(`Hi! We'd love your help at ${loaded.name}. Hope to see you there.`);
      })
      .catch((err) => setError(err.message));
  }, [id, username]);

  useEffect(() => {
    if (!event) return;
    setVolunteers(null);
    findVolunteers({ eventId: event.id, categoryId, area: searchArea, experienced })
      .then((list) => {
        setVolunteers(list);
        setPicked(new Set());
      })
      .catch((err) => setError(err.message));
  }, [event, categoryId, searchArea, experienced, result]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: `/events/${id}/invite` }} />;
  }
  if (!isOrganizer || (event && event.createdBy !== username)) {
    return <Navigate to={`/events/${id}`} replace />;
  }

  const causeName = categories.find((c) => String(c.id) === categoryId)?.category;
  const available = (volunteers || []).filter((v) => !v.status);
  const closed = event && (event.isActive === false || hasEnded(event));
  const left = event ? spotsLeft(event) : null;

  const toggle = (name) => {
    const next = new Set(picked);
    next.has(name) ? next.delete(name) : next.add(name);
    setPicked(next);
  };

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      setResult(await inviteVolunteers(event.id, [...picked], message));
      setPicked(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to={`/events/${id}`} className="inline-flex items-center gap-1.5 font-semibold text-kopi-700 hover:text-kopi-900">
          <span aria-hidden="true">←</span> Back to event
        </Link>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold">Invite volunteers</h1>
        {event && (
          <p className="mt-2 text-kopi-700">
            <span className="font-semibold text-kopi-900">{event.name}</span> · {formatEventWhen(event.fromDate, event.toDate)}
            {formatPlace(event.address) && ` · ${formatPlace(event.address)}`}
            {left != null && ` · ${left === 0 ? 'Full' : `${left} ${left === 1 ? 'spot' : 'spots'} left`}`}
          </p>
        )}
        <p className="mt-4 text-sm text-kopi-700">
          Only volunteers who've chosen to receive invitations appear here. They get your invitation on JoinTeer and can
          say yes in one tap. You never see their contact details.
        </p>

        {closed ? (
          <p className="mt-8 rounded-xl border border-sand-200 bg-white p-6 text-kopi-700">This event has finished or was cancelled, so you can't invite anyone to it.</p>
        ) : (
          <>
            <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr] items-end" onSubmit={(e) => { e.preventDefault(); setSearchArea(area); }}>
              <label className="block">
                <span className="block text-sm font-semibold text-kopi-900 mb-1">Cause</span>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${fieldClass} w-full`}>
                  <option value="">Any cause</option>
                  {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-kopi-900 mb-1">Area</span>
                <span className="flex gap-2">
                  <input type="search" value={area} onChange={(e) => setArea(e.target.value)} onBlur={() => setSearchArea(area)}
                         placeholder={event?.address?.area ? `Anywhere, e.g. ${event.address.area}` : 'Anywhere'}
                         className={`${fieldClass} flex-1 min-w-0`} />
                  <button type="submit" className="h-11 px-4 rounded-lg font-semibold border border-sand-300 bg-white hover:border-kopi-600">Search</button>
                </span>
              </label>
              <label className="sm:col-span-2 flex items-center gap-2 text-kopi-900">
                <input type="checkbox" checked={experienced} onChange={(e) => setExperienced(e.target.checked)} className="w-5 h-5 accent-sambal-700" />
                Only people who've already done {causeName ? `${causeName} events` : 'verified volunteering'}
              </label>
            </form>

            {result && (
              <p role="status" className="mt-6 rounded-xl bg-pandan-50 text-pandan-800 px-4 py-3 font-semibold">
                {result.invited === 0 ? 'No new invitations sent.' : `Sent ${result.invited} ${result.invited === 1 ? 'invitation' : 'invitations'}.`}
                {' '}{result.remaining > 0 ? `You can invite ${result.remaining} more people to this event.` : "That's the limit for this event."}
              </p>
            )}
            {error && <p role="alert" className="mt-6 text-sm text-chilli-700 bg-chilli-50 border border-chilli-100 rounded-lg px-3 py-2">{error}</p>}

            <section className="mt-6 bg-white border border-sand-200 rounded-xl px-5" aria-label="Matching volunteers">
              {!volunteers && !error && <p className="py-6 text-kopi-600">Finding volunteers…</p>}
              {volunteers && volunteers.length === 0 && (
                <p className="py-6 text-kopi-700">No one matches yet. Try another area, or any cause.</p>
              )}
              {volunteers && volunteers.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-3 py-3 border-b border-sand-100">
                    <p className="text-sm text-kopi-700">{volunteers.length} {volunteers.length === 1 ? 'volunteer' : 'volunteers'} · people who've helped you first</p>
                    {available.length > 0 && (
                      <button type="button" onClick={() => setPicked(picked.size === available.length ? new Set() : new Set(available.map((v) => v.username)))}
                              className="text-sm font-semibold text-sambal-700 hover:underline">
                        {picked.size === available.length ? 'Clear' : 'Select all'}
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-sand-100">
                    {volunteers.map((volunteer) => (
                      <VolunteerRow key={volunteer.username} volunteer={volunteer} causeName={causeName}
                                    checked={picked.has(volunteer.username)} onToggle={() => toggle(volunteer.username)} />
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="mt-6 space-y-3" aria-label="Your invitation">
              <label htmlFor="message" className="block font-semibold text-kopi-900">Add a note (optional)</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-sand-300 bg-white text-kopi-900 focus:border-sambal-700 focus:outline-none" />
              <button type="button" onClick={handleSend} disabled={picked.size === 0 || sending}
                      className="inline-flex items-center gap-2 font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-6 py-3 rounded-xl disabled:opacity-50">
                <Icon name="users" className="w-5 h-5" />
                {sending ? 'Sending…' : picked.size ? `Send ${picked.size} ${picked.size === 1 ? 'invitation' : 'invitations'}` : 'Pick people to invite'}
              </button>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default InviteVolunteersPage;
