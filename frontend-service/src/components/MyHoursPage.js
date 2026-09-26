import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getMyHours } from '../api';
import { useAuth } from '../lib/auth';
import { formatEventWhen } from '../lib/format';
import Layout from './Layout';

const formatHours = (hours) => `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

// A volunteer's verified hours; prints as a record for school VIA, scholarships or CVs.
const MyHoursPage = () => {
  const { username, fullName } = useAuth();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    getMyHours().then(setRecord).catch((err) => setError(err.message));
  }, [username]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: '/me/hours' }} />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My volunteering hours</h1>
            <p className="text-slate-600 mt-1">
              Verified record for <strong>{fullName || username}</strong>. Each event links to a certificate schools and employers can check.
            </p>
          </div>
          {record?.entries.length > 0 && (
            <button onClick={() => window.print()} className="print:hidden shrink-0 font-semibold text-violet-700 border border-violet-200 hover:bg-violet-50 px-4 py-2 rounded-xl">
              Print record
            </button>
          )}
        </div>

        {error && <p role="alert" className="mt-6 text-red-600">{error}</p>}
        {!record && !error && <p className="mt-6 text-slate-500">Loading…</p>}

        {record && (
          <>
            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-4xl font-extrabold text-violet-700">{record.totalHours}</p>
                <p className="text-sm text-slate-600">verified hours</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-4xl font-extrabold">{record.entries.length}</p>
                <p className="text-sm text-slate-600">{record.entries.length === 1 ? 'event' : 'events'}</p>
              </div>
            </div>

            {record.entries.length === 0 ? (
              <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                <p className="font-semibold">No verified hours yet.</p>
                <p className="text-sm text-slate-500 mt-1">Join an event and scan the organizer's QR code when you arrive — your hours appear here.</p>
                <Link to="/" className="print:hidden inline-block mt-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg">Find an event</Link>
              </div>
            ) : (
              <table className="w-full mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold">Organizer</th>
                    <th className="px-4 py-3 font-semibold text-right">Hours</th>
                    <th className="px-4 py-3 font-semibold print:hidden"><span className="sr-only">Certificate</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.entries.map((entry) => (
                    <tr key={entry.verificationCode}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{entry.eventName}</p>
                        <p className="text-xs text-slate-500">{formatEventWhen(entry.fromDate, entry.toDate)}</p>
                        <p className="hidden print:block text-xs text-slate-500">Verification code: {entry.verificationCode}</p>
                      </td>
                      <td className="px-4 py-3">{entry.organizerName}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatHours(entry.hours)}</td>
                      <td className="px-4 py-3 text-right print:hidden">
                        <Link to={`/certificate/${entry.verificationCode}`} className="font-medium text-violet-700 hover:underline">Certificate</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyHoursPage;
