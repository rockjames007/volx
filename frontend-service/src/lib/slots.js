// The weekly availability grid: a day and a part of it, e.g. "SAT_MORNING" (same as the backend's TimeSlots).
export const DAYS = [
  { key: 'MON', short: 'Mon', long: 'Monday' },
  { key: 'TUE', short: 'Tue', long: 'Tuesday' },
  { key: 'WED', short: 'Wed', long: 'Wednesday' },
  { key: 'THU', short: 'Thu', long: 'Thursday' },
  { key: 'FRI', short: 'Fri', long: 'Friday' },
  { key: 'SAT', short: 'Sat', long: 'Saturday' },
  { key: 'SUN', short: 'Sun', long: 'Sunday' },
];

// Morning is before noon, afternoon until 5pm, evening after that. start/end: the times we suggest.
export const PARTS = [
  { key: 'MORNING', label: 'Morning', hint: 'before 12pm', start: 9, end: 12 },
  { key: 'AFTERNOON', label: 'Afternoon', hint: '12 to 5pm', start: 14, end: 17 },
  { key: 'EVENING', label: 'Evening', hint: 'after 5pm', start: 19, end: 21 },
];

export const slotKey = (day, part) => `${day}_${part}`;

// "SAT_MORNING" -> "Saturday morning"
export const slotLabel = (slot) => {
  const [day, part] = slot.split('_');
  return `${DAYS.find((d) => d.key === day).long} ${part.toLowerCase()}`;
};

const pad = (n) => String(n).padStart(2, '0');
const toInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

// The next date (from tomorrow) on this slot's day, at the suggested time for its part of the day, as values for
// datetime-local inputs. Keeps durationMinutes if given, otherwise uses the part's suggested end.
export function nextOccurrence(slot, durationMinutes, now = new Date()) {
  const [dayKey, partKey] = slot.split('_');
  const part = PARTS.find((p) => p.key === partKey);
  const targetDay = (DAYS.findIndex((d) => d.key === dayKey) + 1) % 7; // JavaScript: Sunday = 0
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, part.start, 0);
  while (start.getDay() !== targetDay) start.setDate(start.getDate() + 1);
  const end = durationMinutes > 0
    ? new Date(start.getTime() + durationMinutes * 60000)
    : new Date(start.getFullYear(), start.getMonth(), start.getDate(), part.end, 0);
  return { fromDate: toInput(start), toDate: toInput(end) };
}
