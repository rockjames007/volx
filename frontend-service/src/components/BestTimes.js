import React, { useEffect, useState } from 'react';
import { getBestTimes } from '../api';
import { DAYS, PARTS, slotKey, slotLabel } from '../lib/slots';

// Heat level for a count, relative to the busiest slot.
const heat = (count, max) => {
  if (!count || !max) return 'bg-sand-100 text-kopi-600';
  const share = count / max;
  if (share >= 0.75) return 'bg-kaya-400 text-kopi-900';
  if (share >= 0.5) return 'bg-kaya-300 text-kopi-900';
  if (share >= 0.25) return 'bg-kaya-200 text-kopi-900';
  return 'bg-kaya-100 text-kopi-900';
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Event planning for organizers: when volunteers who care about this cause are usually free, and when people have
// actually turned up before. Tapping a time fills in the event's dates.
function BestTimes({ categoryId, causeName, onPick }) {
  const [area, setArea] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [planning, setPlanning] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setFailed(false);
    getBestTimes({ categoryId, area: searchArea })
      .then(setPlanning)
      // Planning help is optional: if it can't load, the form works as before.
      .catch(() => setFailed(true));
  }, [categoryId, searchArea]);

  if (failed) return null;
  if (!categoryId) {
    return (
      <p className="text-sm text-kopi-600 rounded-xl border border-dashed border-sand-300 px-4 py-3 mb-4">
        Choose a category to see when volunteers who care about it are usually free.
      </p>
    );
  }

  const bySlot = Object.fromEntries((planning?.slots || []).map((s) => [s.slot, s]));
  const slots = planning?.slots || [];
  const max = Math.max(0, ...slots.map((s) => s.available));
  const best = [...slots].sort((a, b) => b.available - a.available || b.turnout - a.turnout)[0];
  const yours = [...slots].sort((a, b) => b.yourTurnout - a.yourTurnout)[0];
  // "care about Environment near Tampines"
  const who = `care about ${causeName || 'this cause'}${searchArea ? ` near ${searchArea}` : ''}`;

  return (
    <section aria-labelledby="best-times-heading" className="mb-6 rounded-xl border border-kaya-200 bg-kaya-50 p-4 sm:p-5">
      <h2 id="best-times-heading" className="text-lg font-semibold">When are volunteers free?</h2>
      {!planning && <p className="mt-2 text-sm text-kopi-600">Checking…</p>}
      {planning && (
        <>
          <div className="mt-2 space-y-1 text-kopi-800">
            {max > 0 ? (
              <p>
                <strong className="font-semibold text-kopi-900">Best time: {slotLabel(best.slot)}.</strong>{' '}
                {best.available} of the {plural(planning.withAvailability, 'person', 'people')} who {who} and shared their
                times {best.available === 1 ? 'is' : 'are'} usually free then.
              </p>
            ) : (
              <p>No volunteers who {who} have shared when they're free yet.</p>
            )}
            {yours?.yourTurnout > 0 && (
              <p>Your past volunteers checked in most on <strong className="font-semibold text-kopi-900">{slotLabel(yours.slot)}s</strong> ({plural(yours.yourTurnout, 'check-in', 'check-ins')}).</p>
            )}
          </div>

          <form className="mt-3 flex gap-2 max-w-sm" onSubmit={(e) => { e.preventDefault(); setSearchArea(area); }}>
            <label htmlFor="best-times-area" className="sr-only">Volunteers near</label>
            <input id="best-times-area" type="search" value={area} onChange={(e) => setArea(e.target.value)}
                   onBlur={() => setSearchArea(area)} placeholder="Near an area? e.g. Tampines"
                   className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-sand-300 bg-white text-sm focus:border-sambal-700 focus:outline-none" />
          </form>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-1 text-sm" aria-label="Volunteers usually free, by time">
              <thead>
                <tr>
                  <th className="w-[4.5rem] sm:w-24" aria-hidden="true" />
                  {DAYS.map((day) => <th key={day.key} scope="col" className="text-xs sm:text-sm font-semibold text-kopi-700">{day.short}</th>)}
                </tr>
              </thead>
              <tbody>
                {PARTS.map((part) => (
                  <tr key={part.key}>
                    <th scope="row" className="text-left text-xs sm:text-sm font-semibold text-kopi-900">{part.label}</th>
                    {DAYS.map((day) => {
                      const slot = slotKey(day.key, part.key);
                      const cell = bySlot[slot] || { available: 0, turnout: 0, yourTurnout: 0 };
                      const label = `${slotLabel(slot)}: ${plural(cell.available, 'volunteer', 'volunteers')} usually free`
                        + `${cell.yourTurnout ? `, ${plural(cell.yourTurnout, 'check-in', 'check-ins')} at your past events` : ''}. Use this time`;
                      return (
                        <td key={slot}>
                          <button type="button" onClick={() => onPick(slot)} aria-label={label} title={label}
                                  className={`relative w-full h-11 rounded-lg font-bold tabular-nums hover:ring-2 hover:ring-sambal-700 ${heat(cell.available, max)}`}>
                            {cell.available || ''}
                            {cell.yourTurnout > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sambal-700" aria-hidden="true" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-kopi-700">
            Numbers show volunteers usually free (blank: none yet). A red dot means people came to your events at that time before.
            Tap a time to use it for this event.
          </p>
        </>
      )}
    </section>
  );
}

export default BestTimes;
