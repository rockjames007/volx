import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptInvite, declineInvite } from '../api';
import { formatEventWhen, formatPlace, spotsLeft } from '../lib/format';
import { CategoryPill } from './EventCard';

function Invitation({ invite, onAnswered }) {
  const { event } = invite;
  const [declining, setDeclining] = useState(false);
  const [mute, setMute] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const full = spotsLeft(event) === 0;

  const answer = async (accept) => {
    setBusy(true);
    setError('');
    try {
      if (accept) {
        await acceptInvite(invite.id);
      } else {
        await declineInvite(invite.id, mute);
      }
      onAnswered(invite, accept);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <li className="bg-white border border-kaya-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-sambal-700">{invite.organizerName} invited you</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link to={`/events/${event.id}`} className="text-lg font-semibold text-kopi-900 hover:underline">{event.name}</Link>
        <CategoryPill name={event.category?.category} />
      </div>
      <p className="text-sm text-kopi-700 mt-1">
        {formatEventWhen(event.fromDate, event.toDate)}{formatPlace(event.address) && ` · ${formatPlace(event.address)}`}
      </p>
      {invite.message && (
        <blockquote className="mt-3 border-l-4 border-kaya-300 pl-3 text-kopi-800">“{invite.message}”</blockquote>
      )}

      {declining ? (
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-kopi-900">
            <input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} className="w-5 h-5 accent-sambal-700" />
            Don't send me invitations from {invite.organizerName}
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => answer(false)} disabled={busy}
                    className="font-semibold text-kopi-900 border border-sand-300 bg-white hover:border-kopi-600 px-4 py-2 rounded-lg disabled:opacity-50">
              {busy ? 'Saving…' : 'Decline invitation'}
            </button>
            <button onClick={() => setDeclining(false)} className="font-semibold text-kopi-700 px-4 py-2">Back</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => answer(true)} disabled={busy || full}
                  className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-5 py-2 rounded-lg disabled:opacity-50">
            {full ? 'This event is now full' : busy ? 'Joining…' : "I'm in"}
          </button>
          <button onClick={() => setDeclining(true)} disabled={busy}
                  className="font-semibold text-kopi-800 border border-sand-300 bg-white hover:border-kopi-600 px-4 py-2 rounded-lg">
            Not this time
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-chilli-700">{error}</p>}
    </li>
  );
}

// Invitations from organizers, answered in place. onAnswered(invite, accepted) lets the page refresh.
export function InvitationList({ invites, onAnswered }) {
  if (!invites || invites.length === 0) return null;
  return (
    <section aria-labelledby="invitations-heading" className="mt-8">
      <h2 id="invitations-heading" className="text-xl font-semibold">
        {invites.length === 1 ? "You're invited" : `You're invited to ${invites.length} events`}
      </h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {invites.map((invite) => <Invitation key={invite.id} invite={invite} onAnswered={onAnswered} />)}
      </ul>
    </section>
  );
}

// A one-line reminder on the home page.
export function InvitationsNotice({ count }) {
  if (!count) return null;
  return (
    <Link to="/me" className="flex items-center justify-between gap-4 rounded-xl border border-kaya-200 bg-kaya-50 px-5 py-4 hover:border-kaya-400">
      <span className="font-semibold text-kopi-900">
        {count === 1 ? 'An organizer invited you to an event.' : `Organizers invited you to ${count} events.`}
      </span>
      <span className="font-semibold text-sambal-700 shrink-0">See {count === 1 ? 'invitation' : 'invitations'} →</span>
    </Link>
  );
}
