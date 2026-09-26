import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getCheckInCode, getEvent, getToken, getVolunteers, siteUrl, updateAttendance } from '../api';
import { useAuth } from '../lib/auth';
import { formatEventWhen } from '../lib/format';
import Icon from './Icon';
import Layout from './Layout';

const time = (value) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const dateTime = (value) =>
  new Date(value).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function AttendanceStatus({ volunteer }) {
  if (volunteer.attended === true) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
        <Icon name="check" className="w-3 h-3" />
        {volunteer.checkedInAt ? `Checked in ${time(volunteer.checkedInAt)}` : 'Marked present'}
      </span>
    );
  }
  if (volunteer.attended === false) {
    return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">No-show</span>;
  }
  return <span className="text-xs text-slate-500">Not checked in</span>;
}

function VolunteerRow({ eventId, volunteer, onChange }) {
  const [hours, setHours] = useState(volunteer.hours ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setHours(volunteer.hours ?? ''), [volunteer.hours]);

  const save = async (attendance) => {
    setBusy(true);
    setError('');
    try {
      onChange(await updateAttendance(eventId, volunteer.username, attendance));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">{volunteer.name}</p>
        <p className="text-xs text-slate-500">@{volunteer.username}</p>
      </div>
      <AttendanceStatus volunteer={volunteer} />
      <div className="flex items-center gap-2">
        {volunteer.attended === true ? (
          <>
            <label className="sr-only" htmlFor={`hours-${volunteer.username}`}>Hours for {volunteer.name}</label>
            <input id={`hours-${volunteer.username}`} type="number" min="0.5" max="24" step="0.5" value={hours}
                   onChange={(e) => setHours(e.target.value)}
                   className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
            <button disabled={busy || String(hours) === String(volunteer.hours)}
                    onClick={() => save({ attended: true, hours: Number(hours) })}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40">Save hours</button>
            <button disabled={busy} onClick={() => save({ attended: false })}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">No-show</button>
          </>
        ) : (
          <>
            <button disabled={busy} onClick={() => save({ attended: true })}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50">
              Mark present
            </button>
            {volunteer.attended !== false && (
              <button disabled={busy} onClick={() => save({ attended: false })}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">No-show</button>
            )}
          </>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-red-600 sm:basis-full">{error}</p>}
    </li>
  );
}

// Organizer's screen at the event: the check-in QR code and live attendance.
const AttendancePage = () => {
  const { id } = useParams();
  const { username } = useAuth();
  const [event, setEvent] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [volunteers, setVolunteers] = useState(null);
  const [error, setError] = useState('');

  const loadVolunteers = useCallback(() => getVolunteers(id).then(setVolunteers).catch((err) => setError(err.message)), [id]);

  useEffect(() => {
    if (!getToken()) return;
    getEvent(id).then(setEvent).catch(() => setError("We couldn't load this event."));
    getCheckInCode(id).then(setCheckIn).catch((err) => setError(err.message));
    loadVolunteers();
    // Keep the list live while volunteers scan in.
    const timer = setInterval(loadVolunteers, 15000);
    return () => clearInterval(timer);
  }, [id, loadVolunteers]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: `/events/${id}/attendance` }} />;
  }

  const replaceVolunteer = (updated) =>
    setVolunteers((list) => list.map((v) => (v.username === updated.username ? { ...v, ...updated } : v)));
  const checkInUrl = checkIn && siteUrl(`/check-in/${id}?code=${checkIn.code}`);
  const present = (volunteers || []).filter((v) => v.attended === true).length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to={`/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <Icon name="arrowLeft" className="w-4 h-4" /> Back to event
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-3">Attendance</h1>
        {event && <p className="text-slate-600 mt-1">{event.name} · {formatEventWhen(event.fromDate, event.toDate)}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-5 mt-6">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm" aria-labelledby="qr-heading">
            <h2 id="qr-heading" className="font-bold text-lg">Check-in QR code</h2>
            <p className="text-sm text-slate-600 mt-1">Show this at the event. Volunteers scan it with their phone camera.</p>
            {checkIn ? (
              <>
                <div className="inline-block bg-white p-3 mt-5 rounded-xl border border-slate-200">
                  <QRCodeSVG value={checkInUrl} size={220} level="M" title="Check-in QR code" />
                </div>
                <p className="mt-4 text-sm text-slate-600">Or enter code</p>
                <output className="block text-3xl font-mono font-bold tracking-widest" aria-label="Check-in code">{checkIn.code}</output>
                <p className="mt-4 text-xs text-slate-500">
                  Check-in is open {dateTime(checkIn.opensAt)} – {dateTime(checkIn.closesAt)}.
                </p>
              </>
            ) : (
              !error && <p className="mt-6 text-slate-500">Loading…</p>
            )}
          </section>

          <section className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" aria-labelledby="attendees-heading">
            <div className="flex items-baseline justify-between">
              <h2 id="attendees-heading" className="font-bold text-lg">Volunteers</h2>
              {volunteers && <p className="text-sm text-slate-600">{present} of {volunteers.length} present</p>}
            </div>
            <p className="text-sm text-slate-600 mt-1">Mark people present if they can't scan; hours default to the event's length.</p>
            {volunteers && volunteers.length === 0 && <p className="mt-6 text-slate-500">No one has joined yet. Walk-ins who scan the code are added automatically.</p>}
            {volunteers && volunteers.length > 0 && (
              <ul className="mt-3 divide-y divide-slate-100" aria-label="Attendance">
                {volunteers.map((v) => <VolunteerRow key={v.username} eventId={id} volunteer={v} onChange={replaceVolunteer} />)}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage;
