const time = (date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const day = (date) => date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

// "Sat, 5 Jan · 9:00 AM – 12:00 PM", or "Sat, 5 Jan, 9:00 AM – Sun, 6 Jan, 5:00 PM" across days.
export function formatEventWhen(from, to) {
  if (!from) return '';
  const start = new Date(from);
  if (!to) return `${day(start)} · ${time(start)}`;
  const end = new Date(to);
  if (start.toDateString() === end.toDateString()) {
    return `${day(start)} · ${time(start)} – ${time(end)}`;
  }
  return `${day(start)}, ${time(start)} – ${day(end)}, ${time(end)}`;
}

export const dateBadge = (from) => {
  const date = new Date(from);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
  };
};

// "East Coast Park, Singapore 449876". Older events may still carry a state instead of a postal code.
export const formatPlace = (address) => {
  if (!address) return '';
  const postal = address.pincode ? `Singapore ${address.pincode}` : address.state;
  return [address.area, postal].filter(Boolean).join(', ');
};

// Spots still open, or null when the organizer didn't set a limit.
export const spotsLeft = (event) =>
  event.noOfParticipant ? Math.max(event.noOfParticipant - (event.volunteersJoined || 0), 0) : null;

export const hasEnded = (event) => {
  const end = event.toDate || event.fromDate;
  return end ? new Date(end) < new Date() : false;
};
