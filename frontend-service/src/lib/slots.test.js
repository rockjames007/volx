import { nextOccurrence, slotLabel } from './slots';

test('labels slots in plain words', () => {
  expect(slotLabel('SAT_MORNING')).toBe('Saturday morning');
  expect(slotLabel('WED_EVENING')).toBe('Wednesday evening');
});

test('suggests the next such day, never today', () => {
  // Saturday 5 Jan 2030, 8am: the next Saturday morning is a week later.
  const saturday = new Date(2030, 0, 5, 8, 0);
  expect(nextOccurrence('SAT_MORNING', 0, saturday)).toEqual({ fromDate: '2030-01-12T09:00', toDate: '2030-01-12T12:00' });
  expect(nextOccurrence('SUN_AFTERNOON', 0, saturday)).toEqual({ fromDate: '2030-01-06T14:00', toDate: '2030-01-06T17:00' });
  expect(nextOccurrence('MON_EVENING', 90, saturday)).toEqual({ fromDate: '2030-01-07T19:00', toDate: '2030-01-07T20:30' });
});
