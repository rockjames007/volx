import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { siteUrl, verifyCertificate } from '../api';
import { formatEventWhen } from '../lib/format';
import { Logo } from './Layout';

// Public, printable certificate. Anyone with the link (or the QR code on the printout) can confirm it's genuine.
const CertificatePage = () => {
  const { code } = useParams();
  const [entry, setEntry] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    verifyCertificate(code)
      .then((data) => {
        setEntry(data);
        setStatus('ready');
      })
      .catch(() => setStatus('invalid'));
  }, [code]);

  const url = siteUrl(`/certificate/${code}`);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Logo />
          {status === 'ready' && (
            <button onClick={() => window.print()} className="font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl">
              Print / save as PDF
            </button>
          )}
        </div>

        {status === 'loading' && <p className="text-slate-500">Checking certificate…</p>}
        {status === 'invalid' && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold">We couldn't verify this certificate</h1>
            <p className="text-slate-600 mt-2">The code doesn't match any verified volunteering record. It may have been mistyped or withdrawn by the organizer.</p>
            <Link to="/" className="inline-block mt-6 font-semibold text-violet-700 hover:underline">Go to JoinTeer</Link>
          </div>
        )}
        {status === 'ready' && (
          <article className="bg-white rounded-2xl shadow-sm print:shadow-none border-8 border-double border-violet-200 p-8 sm:p-12 text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-700">Certificate of volunteering</p>
            <p className="mt-8 text-slate-600">This certifies that</p>
            <h1 className="text-4xl font-extrabold tracking-tight mt-2">{entry.volunteerName}</h1>
            <p className="mt-6 text-lg text-slate-700">
              volunteered <strong>{entry.hours} {entry.hours === 1 ? 'hour' : 'hours'}</strong> at
            </p>
            <p className="text-2xl font-bold mt-2">{entry.eventName}</p>
            <p className="mt-2 text-slate-600">
              organized by <strong>{entry.organizerName}</strong>
            </p>
            <p className="mt-1 text-slate-600">{formatEventWhen(entry.fromDate, entry.toDate)}{entry.place ? ` · ${entry.place}` : ''}</p>

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div className="text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-emerald-700">✓ Verified by JoinTeer attendance records</p>
                <p className="mt-1">Verify at <span className="break-all">{url}</span></p>
                <p className="mt-1 font-mono text-xs">Code: {entry.verificationCode}</p>
              </div>
              <QRCodeSVG value={url} size={96} level="M" title="Verification QR code" />
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
