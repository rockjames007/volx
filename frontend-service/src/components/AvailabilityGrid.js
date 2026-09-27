import React from 'react';
import { DAYS, PARTS, slotKey } from '../lib/slots';

// Volunteers tick when they're usually free: seven days by morning, afternoon and evening.
function AvailabilityGrid({ selected, onChange, disabled = false }) {
  const toggle = (slot) => {
    const next = new Set(selected);
    next.has(slot) ? next.delete(slot) : next.add(slot);
    onChange(next);
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-1 text-sm" aria-label="When you're usually free">
        <thead>
          <tr>
            <th className="w-[5.5rem] sm:w-28" aria-hidden="true" />
            {DAYS.map((day) => <th key={day.key} scope="col" className="text-xs sm:text-sm font-semibold text-kopi-700"><abbr title={day.long} className="no-underline">{day.short}</abbr></th>)}
          </tr>
        </thead>
        <tbody>
          {PARTS.map((part) => (
            <tr key={part.key}>
              <th scope="row" className="text-left font-semibold text-kopi-900 pr-1">
                {part.label}<span className="block font-normal text-kopi-600">{part.hint}</span>
              </th>
              {DAYS.map((day) => {
                const slot = slotKey(day.key, part.key);
                const on = selected.has(slot);
                return (
                  <td key={slot}>
                    <button type="button" onClick={() => toggle(slot)} disabled={disabled} aria-pressed={on}
                            aria-label={`${day.long} ${part.label.toLowerCase()}`}
                            className={`w-full h-11 rounded-lg border font-bold transition ${on ? 'bg-sambal-700 border-sambal-700 text-white' : 'bg-white border-sand-300 text-kopi-400 hover:border-kopi-600'}`}>
                      {on ? '✓' : ''}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AvailabilityGrid;
