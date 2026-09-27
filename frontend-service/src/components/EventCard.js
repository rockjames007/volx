import React from 'react';
import { Link } from 'react-router-dom';
import { categoryStyle, CauseIcon } from '../lib/categories';
import { dateBadge, formatEventWhen, formatPlace, spotsLeft } from '../lib/format';
import Icon from './Icon';

export function SpotsBar({ event, className = '' }) {
  if (!event.noOfParticipant) {
    return <p className={`text-sm text-kopi-600 ${className}`}>Open to everyone</p>;
  }
  const joined = event.volunteersJoined || 0;
  const left = spotsLeft(event);
  const percent = Math.min(100, Math.round((joined / event.noOfParticipant) * 100));
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1.5 tabular-nums">
        <span className={left === 0 ? 'font-semibold text-kopi-900' : 'text-kopi-700'}>
          {left === 0 ? 'Full' : `${left} of ${event.noOfParticipant} spots left`}
        </span>
        <span className="text-kopi-600">{joined} going</span>
      </div>
      <div className="h-2 rounded-full bg-sand-100 overflow-hidden" role="progressbar"
           aria-valuenow={joined} aria-valuemin={0} aria-valuemax={event.noOfParticipant}
           aria-label="Volunteers signed up">
        <div className="h-full rounded-full bg-kaya-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export const CategoryPill = ({ name }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${categoryStyle(name).tag}`}>
    <CauseIcon name={name} className="w-4 h-4" />{name || 'Other'}
  </span>
);

const EventCard = ({ event, going = false }) => {
  const badge = dateBadge(event.fromDate);
  const place = formatPlace(event.address);
  const cancelled = event.isActive === false;
  return (
    <Link to={`/events/${event.id}`}
          className="group flex flex-col bg-white rounded-xl border border-sand-200 hover:border-sand-300 hover:shadow-md transition p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 text-center rounded-lg bg-rice-100 py-1.5">
          <div className="text-sm font-semibold uppercase text-sambal-700">{badge.month}</div>
          <div className="font-display text-2xl font-semibold leading-tight">{badge.day}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryPill name={event.category?.category} />
            {cancelled && (
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-chilli-50 text-chilli-700">Cancelled</span>
            )}
            {going && !cancelled && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full bg-pandan-100 text-pandan-800">
                <Icon name="check" className="w-4 h-4" weight="bold" /> You're going
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg md:text-xl leading-snug text-kopi-900 group-hover:text-sambal-700">{event.name}</h3>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-kopi-700">
        <li className="flex items-center gap-2"><Icon name="calendar" className="w-5 h-5 text-kopi-600 shrink-0" />{formatEventWhen(event.fromDate, event.toDate)}</li>
        {place && <li className="flex items-center gap-2"><Icon name="pin" className="w-5 h-5 text-kopi-600 shrink-0" />{place}</li>}
      </ul>
      {event.description && <p className="mt-3 text-kopi-700 line-clamp-2">{event.description}</p>}
      {!cancelled && <SpotsBar event={event} className="mt-auto pt-5" />}
    </Link>
  );
};

export default EventCard;
