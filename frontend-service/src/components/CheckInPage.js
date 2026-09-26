import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { checkIn } from '../api';
import { useAuth } from '../lib/auth';
import Icon from './Icon';
import Layout from './Layout';

// Opened by scanning an event's check-in QR code on the volunteer's phone.
const CheckInPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { username } = useAuth();
  const code = searchParams.get('code') || '';
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    // Check in once, even under React's development double-render.
    if (!username || !code || attempted.current) return;
    attempted.current = true;
    checkIn(id, code).then(setResult).catch((err) => setError(err.message));
  }, [id, code, username]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        {!code && <p className="text-slate-600">This check-in link is missing its code. Please scan the QR code at the event again.</p>}
        {code && !result && !error && <p className="text-slate-600">Checking you in…</p>}
        {result && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
              <Icon name="check" className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold mt-4">{result.alreadyCheckedIn ? "You're already checked in" : "You're checked in!"}</h1>
            <p className="text-slate-600 mt-2">
              {result.eventName}: <strong>{result.hours} {result.hours === 1 ? 'hour' : 'hours'}</strong> added to your verified record.
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <Link to={`/certificate/${result.verificationCode}`} className="font-semibold text-white bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-xl">View certificate</Link>
              <Link to="/me/hours" className="font-medium text-violet-700 hover:underline">See all my hours</Link>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8">
            <h1 className="text-xl font-bold">We couldn't check you in</h1>
            <p role="alert" className="text-red-700 mt-2">{error}</p>
            <p className="text-sm text-slate-500 mt-4">If this keeps happening, ask the organizer to mark you present.</p>
            <Link to={`/events/${id}`} className="inline-block mt-4 font-medium text-violet-700 hover:underline">View the event</Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckInPage;
