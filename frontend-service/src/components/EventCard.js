import React from 'react';
import { Link } from 'react-router-dom';
import { categoryStyle } from '../lib/categories';
import { dateBadge, formatEventWhen, formatPlace, spotsLeft } from '../lib/format';
import Icon from './Icon';

export function SpotsBar({ event, className = '' }) {
  if (!event.noOfParticipant) {
    return <p className={`text-sm text-slate-500 ${className}`}>Open to everyone</p>;
  }
  const joined = event.volunteersJoined || 0;
  const left = spotsLeft(event);
  const percent = Math.min(100, Math.round((joined / event.noOfParticipant) * 100));
  const style = categoryStyle(event.category?.category);
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className={left === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}>
          {left === 0 ? 'Full' : `${left} of ${event.noOfParticipant} spots left`}
        </span>
        <span className="text-slate-400">{joined} going</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar"
           aria-valuenow={joined} aria-valuemin={0} aria-valuemax={event.noOfParticipant}
           aria-label="Volunteers signed up">
        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export const CategoryPill = ({ name }) => {
  const style = categoryStyle(name);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.pill}`}>
      <span aria-hidden="true">{style.emoji}</span>{name || 'Other'}
    </span>
  );
};

const EventCard = ({ event, going = false }) => {
  const badge = dateBadge(event.fromDate);
  const place = formatPlace(event.address);
  const cancelled = event.isActive === false;
  return (
    <Link to={`/events/${event.id}`}
          className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition p-5 focus:outline-none focus:ring-2 focus:ring-violet-500">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 text-center rounded-xl bg-slate-50 border border-slate-200 py-1.5">
          <div className="text-xs font-semibold uppercase text-violet-600">{badge.month}</div>
          <div className="text-xl font-bold leading-tight">{badge.day}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <CategoryPill name={event.category?.category} />
            {cancelled && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800">Cancelled</span>
            )}
            {going && !cancelled && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-600 text-white">
                <Icon name="check" className="w-3 h-3" /> You're going
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg leading-snug text-slate-900 group-hover:text-violet-700">{event.name}</h3>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        <li className="flex items-center gap-2"><Icon name="calendar" className="w-4 h-4 text-slate-400" />{formatEventWhen(event.fromDate, event.toDate)}</li>
        {place && <li className="flex items-center gap-2"><Icon name="pin" className="w-4 h-4 text-slate-400" />{place}</li>}
      </ul>
      {event.description && <p className="mt-3 text-sm text-slate-600 line-clamp-2">{event.description}</p>}
      {!cancelled && <SpotsBar event={event} className="mt-auto pt-4" />}
    </Link>
  );
};

export default EventCard;
