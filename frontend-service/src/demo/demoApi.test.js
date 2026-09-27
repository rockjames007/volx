import { demoRequest, resetDemo, seed } from './demoApi';

const as = (token) => (path, options = {}) => demoRequest(path, { ...options, token });
const inHours = (hours) => {
  const date = new Date(Date.now() + hours * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

beforeEach(() => {
  localStorage.clear();
  resetDemo();
});

test('lists the upcoming sample events, soonest first', async () => {
  const page = await demoRequest('/profile/events?page=0&size=50&sort=fromDate');
  expect(page.content).toHaveLength(12);
  expect(page.content[0].name).toBe('Befriending seniors: kopi and a chat');
  const full = page.content.find((e) => e.name === 'Pack and deliver food rations');
  expect(full.volunteersJoined).toBe(full.noOfParticipant);
  expect(page.content.every((e) => e.checkInCode === undefined)).toBe(true);
});

test('the demo volunteer can log in, join and leave, and has verified hours', async () => {
  const session = await demoRequest('/auth/authorize', { method: 'POST', body: { username: 'test@gmail.com', password: 'test123' } });
  expect(session).toMatchObject({ username: 'test', role: 'VOLUNTEER', fullName: 'Test Volunteer' });
  const volunteer = as(session.jwt);

  const hours = await volunteer('/profile/me/hours');
  expect(hours.totalHours).toBe(12);
  expect(hours.entries).toHaveLength(4);
  const certificate = await demoRequest(`/profile/verify/${hours.entries[0].verificationCode}`);
  expect(certificate.volunteerName).toBe('Test Volunteer');

  const joined = await volunteer('/profile/events/3/volunteers', { method: 'POST' });
  expect(joined.volunteersJoined).toBe(8);
  await expect(volunteer('/profile/events/3/volunteers', { method: 'POST' })).rejects.toThrow('You have already joined this event');
  await expect(volunteer('/profile/events/7/volunteers', { method: 'POST' })).rejects.toThrow('This event is full');
  expect((await volunteer('/profile/events/3/volunteers', { method: 'DELETE' })).volunteersJoined).toBe(7);
});

test('rejects wrong passwords and private requests without a login', async () => {
  await expect(demoRequest('/auth/authorize', { method: 'POST', body: { username: 'test', password: 'nope' } }))
    .rejects.toThrow('Incorrect username or password');
  await expect(demoRequest('/profile/me/events')).rejects.toMatchObject({ status: 401 });
});

test('the demo organizer can post, check volunteers in and see attendees', async () => {
  const organizer = as('demo.org');
  const volunteer = as('demo.test');
  const categories = await demoRequest('/profile/categories');

  // Starts in half an hour, so check-in is already open.
  const posted = await organizer('/profile/events', {
    method: 'POST',
    body: { name: 'Litter pick', description: '', categoryId: Number(categories[0].id), fromDate: inHours(0.5), toDate: inHours(2.5), noOfParticipant: 5, address: { area: 'Bishan' } },
  });
  expect(posted.organizerName).toBe('Green Singapore Community');
  await expect(volunteer('/profile/events', { method: 'POST', body: {} })).rejects.toThrow('Only organizer accounts can post events');

  const { code } = await organizer(`/profile/events/${posted.id}/check-in-code`);
  const checkIn = await volunteer(`/profile/events/${posted.id}/check-in`, { method: 'POST', body: { code } });
  expect(checkIn).toMatchObject({ hours: 2, alreadyCheckedIn: false });

  const attendees = await organizer(`/profile/events/${posted.id}/volunteers`);
  expect(attendees).toEqual([expect.objectContaining({ name: 'Test Volunteer', attended: true })]);
  await expect(volunteer(`/profile/events/${posted.id}/volunteers`)).rejects.toThrow("Only this event's organizer can do that");
});

test('a new account can be registered and used', async () => {
  const session = await demoRequest('/auth/register', {
    method: 'POST',
    body: { username: 'mei', email: 'mei@example.com', password: 'secret1', fullName: 'Mei Tan', role: 'VOLUNTEER' },
  });
  expect(session.jwt).toBe('demo.mei');
  await expect(demoRequest('/auth/register', { method: 'POST', body: { username: 'MEI', email: 'x@example.com', password: 'secret1', fullName: 'X' } }))
    .rejects.toThrow('That username is taken');
  expect((await as(session.jwt)('/profile/me/events')).joined).toEqual([]);
});

test('sample dates are always relative to today', () => {
  const data = seed(new Date(2030, 0, 1, 12));
  expect(data.events.find((e) => e.name === 'Befriending seniors: kopi and a chat').fromDate).toBe('2030-01-03T15:00:00');
});

test('organizers find the sample volunteers and invitations can be accepted', async () => {
  const organizer = as('demo.org');
  const volunteer = as('demo.test');
  const all = await organizer('/profile/volunteers/search');
  expect(all).toHaveLength(31);
  // People who've helped Green Singapore Community come first; nobody's contact details are shared.
  expect(all[0].eventsWithYou).toBe(1);
  expect(all[0].email).toBeUndefined();
  expect(all.find((v) => v.username === 'test').name).toBe('Test V.');

  const nearby = await organizer('/profile/volunteers/search?categoryId=5&area=tampines&experienced=true');
  expect(nearby.every((v) => v.area === 'Tampines' && v.causeEvents > 0)).toBe(true);
  await expect(volunteer('/profile/volunteers/search')).rejects.toThrow('Only organizer accounts can find volunteers');

  // Emergency supply packing (event 10) is Green Singapore Community's and still upcoming.
  const sent = await organizer('/profile/events/10/invites', { method: 'POST', body: { usernames: ['test', 'test', 'nobody'], message: 'Hope you can come!' } });
  expect(sent).toEqual({ invited: 1, skipped: 1, remaining: 89 });
  const [invite] = await volunteer('/profile/me/invites');
  expect(invite).toMatchObject({ organizerName: 'Green Singapore Community', message: 'Hope you can come!' });
  expect((await volunteer(`/profile/me/invites/${invite.id}/accept`, { method: 'POST' })).volunteersJoined).toBe(12);
  expect(await volunteer('/profile/me/invites')).toEqual([]);
  expect(await organizer('/profile/events/10/invites')).toEqual([expect.objectContaining({ username: 'test', status: 'JOINED' })]);
});

test('declining can mute an organizer, and preferences can allow them again', async () => {
  const organizer = as('demo.org');
  const volunteer = as('demo.test');
  await organizer('/profile/events/10/invites', { method: 'POST', body: { usernames: ['test'] } });
  const [invite] = await volunteer('/profile/me/invites');
  await volunteer(`/profile/me/invites/${invite.id}/decline`, { method: 'POST', body: { muteOrganizer: true } });

  expect((await organizer('/profile/volunteers/search')).some((v) => v.username === 'test')).toBe(false);
  const preferences = await volunteer('/profile/me/preferences');
  expect(preferences.mutedOrganizers).toEqual([{ username: 'org', name: 'Green Singapore Community' }]);

  await volunteer('/profile/me/preferences', { method: 'PUT', body: { ...preferences, mutedOrganizers: [] } });
  expect((await organizer('/profile/volunteers/search')).some((v) => v.username === 'test')).toBe(true);
});

test('organizers see when the sample volunteers are usually free', async () => {
  const organizer = as('demo.org');
  const all = await organizer('/profile/planning/best-times');
  expect(all.matchingVolunteers).toBe(31);
  expect(all.withAvailability).toBe(29);
  const best = [...all.slots].sort((a, b) => b.available - a.available)[0];
  expect(best).toMatchObject({ slot: 'SAT_MORNING', available: 21 });
  expect(all.slots.reduce((sum, s) => sum + s.yourTurnout, 0)).toBe(14);
  await expect(as('demo.test')('/profile/planning/best-times')).rejects.toThrow('Only organizer accounts can plan events');

  // Volunteers' own availability is saved, and leaving it out keeps it.
  const volunteer = as('demo.test');
  const saved = await volunteer('/profile/me/preferences', { method: 'PUT', body: { interests: [], availability: ['FRI_EVENING', 'MON_MORNING', 'NOPE'], discoverable: true } });
  expect(saved.availability).toEqual(['MON_MORNING', 'FRI_EVENING']);
  const kept = await volunteer('/profile/me/preferences', { method: 'PUT', body: { interests: [], discoverable: true } });
  expect(kept.availability).toEqual(['MON_MORNING', 'FRI_EVENING']);
});
