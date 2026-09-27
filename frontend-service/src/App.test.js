import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

const CATEGORIES = [
  { id: '1', category: 'Environment', categoryDescription: 'Clean-ups and tree planting' },
  { id: '2', category: 'Education', categoryDescription: 'Tutoring and mentoring' },
];

const inDays = (days, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString().slice(0, 19);
};

const event = (overrides) => ({
  id: 1,
  name: 'Beach clean-up',
  category: CATEGORIES[0],
  fromDate: inDays(3, 9),
  toDate: inDays(3, 12),
  noOfParticipant: 10,
  volunteersJoined: 4,
  createdBy: 'org',
  address: { area: 'East Coast Park', pincode: '449876' },
  ...overrides,
});

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

// Routes fetch calls by "METHOD path" prefix, so tests don't depend on the order pages load data in.
function mockApi(routes) {
  global.fetch = jest.fn((url, options = {}) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const key = Object.keys(routes).find((route) => {
      const [method, prefix] = route.split(' ');
      return method === (options.method || 'GET') && path.startsWith(prefix);
    });
    if (!key) return json({ message: `Unmocked ${options.method || 'GET'} ${path}` }, 500);
    const handler = routes[key];
    return typeof handler === 'function' ? handler(path, options) : json(handler);
  });
}

const callsTo = (method, prefix) =>
  fetch.mock.calls.filter(([url, options = {}]) => (options.method || 'GET') === method && url.includes(prefix));

const NO_PREFERENCES = { interests: [], area: null, discoverable: false, mutedOrganizers: [] };

const logIn = (username = 'test', role = 'VOLUNTEER', organizationName = null) => {
  localStorage.setItem('volx.token', 'token-123');
  localStorage.setItem('volx.username', username);
  localStorage.setItem('volx.profile', JSON.stringify({ role, fullName: `Full ${username}`, organizationName }));
};
const logInAsOrganizer = (username = 'org') => logIn(username, 'ORGANIZER', 'Green Singapore Community');

const visit = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

beforeEach(() => {
  localStorage.clear();
});

describe('home page', () => {
  test('explains the mission and lists upcoming events with real stats', async () => {
    mockApi({
      'GET /profile/events': { content: [event(), event({ id: 2, name: 'Reading club', category: CATEGORIES[1], noOfParticipant: 5, volunteersJoined: 5 })] },
      'GET /profile/categories': CATEGORIES,
    });
    visit('/');

    expect(screen.getByRole('heading', { name: /got a few hours this weekend/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /jointeer home/i }).length).toBeGreaterThan(0);
    expect(await screen.findByText('Beach clean-up')).toBeInTheDocument();
    expect(screen.getByText('6 of 10 spots left')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText(/2 events · 6 volunteer spots open/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /post your events on jointeer/i })).toHaveAttribute('href', '/register?type=organizer');
  });

  test('filters by cause and by search text', async () => {
    mockApi({
      'GET /profile/events': { content: [event(), event({ id: 2, name: 'Reading club', category: CATEGORIES[1] })] },
      'GET /profile/categories': CATEGORIES,
    });
    visit('/');
    await screen.findByText('Reading club');

    fireEvent.click(screen.getByRole('button', { name: /education/i }));
    expect(screen.queryByText('Beach clean-up')).not.toBeInTheDocument();
    expect(screen.getByText('Reading club')).toBeInTheDocument();

    // Tapping the selected cause again clears the filter.
    fireEvent.click(screen.getByRole('button', { name: /education/i, pressed: true }));
    fireEvent.change(screen.getByPlaceholderText(/search a place/i), { target: { value: 'east coast' } });
    expect(screen.getAllByText('East Coast Park, Singapore 449876').length).toBe(2);
    fireEvent.change(screen.getByPlaceholderText(/search a place/i), { target: { value: 'zzz' } });
    expect(screen.getByText('No events match that yet.')).toBeInTheDocument();
  });

  test('shows a friendly message when events cannot be loaded', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    visit('/');
    expect(await screen.findByText(/we can't load events right now/i)).toBeInTheDocument();
  });

  test('recommends events matching the causes a user picked', async () => {
    logIn();
    localStorage.setItem('volx.interests.test', JSON.stringify(['2']));
    mockApi({
      'GET /profile/events': { content: [event(), event({ id: 2, name: 'Reading club', category: CATEGORIES[1] })] },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/');

    const picked = (await screen.findByRole('heading', { name: /picked for you/i })).closest('section');
    expect(within(picked).getByText('Reading club')).toBeInTheDocument();
    expect(within(picked).queryByText('Beach clean-up')).not.toBeInTheDocument();
  });
});

describe('volunteering for an event', () => {
  test('logged-out visitors are asked to log in and then returned to the event', async () => {
    mockApi({
      'GET /profile/events/1': event(),
      'POST /auth/authorize': { jwt: 'token-123', username: 'test', expiresIn: 3600000 },
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/events/1');

    fireEvent.click(await screen.findByRole('link', { name: /log in to volunteer/i }));
    fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('button', { name: /join as a volunteer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Beach clean-up' })).toBeInTheDocument();
  });

  test('joining and leaving update the spots and the button', async () => {
    logIn();
    mockApi({
      'GET /profile/events/1': event(),
      'GET /profile/me/events': { joined: [], organizing: [] },
      'POST /profile/events/1/volunteers': event({ volunteersJoined: 5 }),
      'DELETE /profile/events/1/volunteers': event({ volunteersJoined: 4 }),
    });
    visit('/events/1');

    fireEvent.click(await screen.findByRole('button', { name: /join as a volunteer/i }));
    expect(await screen.findByText(/you're in\. see you there/i)).toBeInTheDocument();
    expect(screen.getByText('5 of 10 spots left')).toBeInTheDocument();
    expect(callsTo('POST', '/profile/events/1/volunteers')[0][1].headers.Authorization).toBe('Bearer token-123');

    fireEvent.click(screen.getByRole('button', { name: /can't make it/i }));
    expect(await screen.findByRole('button', { name: /join as a volunteer/i })).toBeInTheDocument();
    expect(screen.getByText('6 of 10 spots left')).toBeInTheDocument();
  });

  test('shows the reason when joining fails', async () => {
    logIn();
    mockApi({
      'GET /profile/events/1': event(),
      'GET /profile/me/events': { joined: [], organizing: [] },
      'POST /profile/events/1/volunteers': () => json({ message: 'This event is full' }, 409),
    });
    visit('/events/1');

    fireEvent.click(await screen.findByRole('button', { name: /join as a volunteer/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This event is full');
  });

  test('a full event cannot be joined, and organizers see their own status', async () => {
    logInAsOrganizer('org');
    mockApi({
      'GET /profile/events/1/volunteers': [],
      'GET /profile/events/1': event({ volunteersJoined: 10 }),
      'GET /profile/me/events': { joined: [], organizing: [event()] },
    });
    visit('/events/1');
    expect(await screen.findByText(/you're organizing this event/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /join as a volunteer/i })).not.toBeInTheDocument();
  });

  test('unknown events show a helpful not-found page', async () => {
    mockApi({ 'GET /profile/events/99': () => json({ message: 'Not found' }, 404) });
    visit('/events/99');
    expect(await screen.findByRole('heading', { name: /couldn't find that event/i })).toBeInTheDocument();
  });
});

describe('accounts', () => {
  test('logging in greets the user in the header', async () => {
    mockApi({
      'POST /auth/authorize': { jwt: 'token-123', username: 'test', expiresIn: 3600000 },
      'GET /profile/events': { content: [] },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/login');

    fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Hi test,')).toBeInTheDocument();
    expect(localStorage.getItem('volx.token')).toBe('token-123');
    expect(JSON.parse(callsTo('POST', '/auth/authorize')[0][1].body)).toEqual({ username: 'test@gmail.com', password: 'test123' });
  });

  test('shows the server error on a failed login', async () => {
    mockApi({ 'POST /auth/authorize': () => json({ message: 'Invalid username or password' }, 401) });
    visit('/login');

    fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'y' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
  });

  test('new users pick their causes after signing up', async () => {
    mockApi({
      'POST /auth/register': { jwt: 'token-123', username: 'newbie', expiresIn: 3600000, role: 'VOLUNTEER', fullName: 'New Bie' },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/events': { content: [] },
      'GET /profile/me/events': { joined: [], organizing: [] },
      'GET /profile/me/preferences': NO_PREFERENCES,
      'PUT /profile/me/preferences': (path, options) => json({ ...JSON.parse(options.body), mutedOrganizers: [] }),
    });
    visit('/register');

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Bie' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newbie' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newbie@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    fireEvent.click(await screen.findByRole('button', { name: /environment/i }));
    fireEvent.change(screen.getByLabelText(/where would you like to help/i), { target: { value: 'Tampines' } });
    fireEvent.click(screen.getByLabelText(/let organizers invite me/i));
    fireEvent.click(screen.getByRole('button', { name: /save and show me events/i }));

    expect(await screen.findByText('Hi New,')).toBeInTheDocument();
    expect(JSON.parse(callsTo('PUT', '/profile/me/preferences')[0][1].body))
      .toEqual({ interests: [1], area: 'Tampines', discoverable: true, mutedOrganizers: [] });
    expect(JSON.parse(localStorage.getItem('volx.interests.newbie'))).toEqual(['1']);
  });

  test('organizers see the events they organize and the ones they joined', async () => {
    logInAsOrganizer('test');
    mockApi({
      'GET /profile/me/events': { joined: [event()], organizing: [event({ id: 7, name: 'Blood drive' })] },
    });
    visit('/me');

    expect(await screen.findByText('Blood drive')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /going/i }));
    expect(screen.getByText('Beach clean-up')).toBeInTheDocument();
    expect(screen.getByText("You're going")).toBeInTheDocument();
  });

  test('my events requires logging in', () => {
    visit('/me');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});

describe('posting an event', () => {
  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Beach clean-up' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/starts/i), { target: { value: '2030-01-05T09:00' } });
    fireEvent.change(screen.getByLabelText(/ends/i), { target: { value: '2030-01-05T12:00' } });
    fireEvent.change(screen.getByLabelText(/volunteers needed/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '449876' } });
  };

  test('redirects to login when logged out', () => {
    visit('/events/new');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  test('publishes the event and opens its page', async () => {
    logInAsOrganizer('test');
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'POST /profile/events': event({ id: 10, noOfParticipant: 15, volunteersJoined: 0 }),
      'GET /profile/events/10/volunteers': [],
      'GET /profile/events/10': event({ id: 10, noOfParticipant: 15, volunteersJoined: 0, createdBy: 'test' }),
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/events/new');
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByText(/you're organizing this event/i)).toBeInTheDocument();
    const [, options] = callsTo('POST', '/profile/events')[0];
    expect(options.headers.Authorization).toBe('Bearer token-123');
    expect(JSON.parse(options.body)).toMatchObject({
      name: 'Beach clean-up', categoryId: 1, fromDate: '2030-01-05T09:00', toDate: '2030-01-05T12:00', noOfParticipant: 15,
      address: { pincode: '449876', country: 'Singapore' },
    });
  });

  test('shows validation errors from the server', async () => {
    logInAsOrganizer();
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'POST /profile/events': () => json({ message: 'fromDate: must be a future date' }, 400),
    });
    visit('/events/new');
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('fromDate: must be a future date');
  });

  test('sends the user to log in again when the session has expired', async () => {
    logInAsOrganizer();
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'POST /profile/events': () => json({ message: 'Your session has expired, please log in again' }, 401),
    });
    visit('/events/new');
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem('volx.token')).toBeNull();
  });
});

describe('account types and organizer tools', () => {
  test('signing up as an organizer asks for the organization and goes to posting an event', async () => {
    mockApi({
      'POST /auth/register': { jwt: 'token-123', username: 'greensg', role: 'ORGANIZER', fullName: 'Mei Lin Tan', organizationName: 'Green SG' },
      'GET /profile/categories': CATEGORIES,
    });
    visit('/register?type=organizer');

    expect(screen.getByRole('radio', { name: /i organize events/i })).toBeChecked();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Mei Lin Tan' } });
    fireEvent.change(screen.getByLabelText(/organization name/i), { target: { value: 'Green SG' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'greensg' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'hello@greensg.example' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('heading', { name: /post an event/i })).toBeInTheDocument();
    expect(JSON.parse(callsTo('POST', '/auth/register')[0][1].body)).toMatchObject({
      role: 'ORGANIZER', organizationName: 'Green SG', fullName: 'Mei Lin Tan',
    });
  });

  test('organizers must give an organization name', () => {
    global.fetch = jest.fn();
    visit('/register');
    fireEvent.click(screen.getByRole('radio', { name: /i organize events/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText('Organization name is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('volunteers are not offered posting, and the post page explains why', async () => {
    logIn('test');
    mockApi({
      'GET /profile/events': { content: [] },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    const { unmount } = visit('/');
    await screen.findByText(/no upcoming events yet/i);
    expect(screen.queryByRole('link', { name: /post an event/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/running a cause/i)).not.toBeInTheDocument();
    unmount();

    visit('/events/new');
    expect(screen.getByRole('heading', { name: /posting events is for organizer accounts/i })).toBeInTheDocument();
  });

  test('organizers see who joined and can cancel their event', async () => {
    logInAsOrganizer('org');
    mockApi({
      'GET /profile/events/1/volunteers': [
        { username: 'alice', name: 'Alice Tan', joinedAt: '2030-01-01T10:00:00' },
        { username: 'bob', name: 'Bob Lim', joinedAt: '2030-01-02T10:00:00' },
      ],
      'GET /profile/events/1': event({ volunteersJoined: 2 }),
      'GET /profile/me/events': { joined: [], organizing: [event()] },
      'POST /profile/events/1/cancel': event({ volunteersJoined: 2, isActive: false }),
    });
    visit('/events/1');

    const list = await screen.findByRole('list', { name: /volunteers who joined/i });
    expect(within(list).getByText('Alice Tan')).toBeInTheDocument();
    expect(within(list).getByText('Bob Lim')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit event/i })).toHaveAttribute('href', '/events/1/edit');

    fireEvent.click(screen.getByRole('button', { name: /cancel event/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes, cancel event/i }));

    expect(await screen.findByText('This event has been cancelled.')).toBeInTheDocument();
    expect(callsTo('POST', '/profile/events/1/cancel')).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /edit event/i })).not.toBeInTheDocument();
  });

  test('editing prefills the form and saves the changes', async () => {
    logInAsOrganizer('org');
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'PUT /profile/events/1': event({ name: 'Beach clean-up (bring gloves)' }),
      'GET /profile/events/1/volunteers': [],
      'GET /profile/events/1': event({ fromDate: '2030-01-05T09:00:00', toDate: '2030-01-05T12:00:00' }),
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/events/1/edit');

    expect(await screen.findByRole('heading', { name: /edit event/i })).toBeInTheDocument();
    await screen.findByDisplayValue('Beach clean-up');
    expect(screen.getByLabelText(/starts/i)).toHaveValue('2030-01-05T09:00');
    expect(screen.getByLabelText(/postal code/i)).toHaveValue('449876');

    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Beach clean-up (bring gloves)' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/you're organizing this event/i)).toBeInTheDocument();
    expect(JSON.parse(callsTo('PUT', '/profile/events/1')[0][1].body)).toMatchObject({
      name: 'Beach clean-up (bring gloves)', categoryId: 1, fromDate: '2030-01-05T09:00',
    });
  });

  test('the edit form waits for the event, so early typing is never overwritten', async () => {
    logInAsOrganizer('org');
    let finishLoading;
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'GET /profile/events/1': () => new Promise((resolve) => { finishLoading = () => resolve(json(event())); }),
    });
    visit('/events/1/edit');

    expect(screen.getByText('Loading event…')).toBeInTheDocument();
    expect(screen.queryByLabelText(/event name/i)).not.toBeInTheDocument();
    finishLoading();
    expect(await screen.findByDisplayValue('Beach clean-up')).toBeInTheDocument();
  });

  test('volunteers see a cancelled event clearly and cannot join it', async () => {
    logIn('test');
    mockApi({
      'GET /profile/events/1': event({ isActive: false, organizerName: 'Green Singapore Community' }),
      'GET /profile/me/events': { joined: [event({ isActive: false })], organizing: [] },
    });
    visit('/events/1');

    expect(await screen.findByText('This event has been cancelled.')).toBeInTheDocument();
    expect(await screen.findByText(/cancelled by the organizer\. You don't need to do anything\./i)).toBeInTheDocument();
    expect(screen.getByText(/organized by green singapore community/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /join as a volunteer/i })).not.toBeInTheDocument();
  });
});

describe('check-in, verified hours and certificates', () => {
  const volunteers = [
    { username: 'alice', name: 'Alice Tan', joinedAt: '2030-01-01T10:00:00', attended: null, checkedInAt: null, hours: null },
    { username: 'bob', name: 'Bob Lim', joinedAt: '2030-01-02T10:00:00', attended: true, checkedInAt: '2030-01-05T08:55:00', hours: 3 },
  ];

  test('organizer attendance page shows the check-in QR code and marks people present', async () => {
    logInAsOrganizer('org');
    mockApi({
      'GET /profile/events/1/check-in-code': { code: 'K7Q2M9XP', opensAt: '2030-01-05T08:00:00', closesAt: '2030-01-05T15:00:00' },
      'GET /profile/events/1/volunteers': volunteers,
      'PUT /profile/events/1/volunteers/alice/attendance': { ...volunteers[0], attended: true, hours: 3 },
      'GET /profile/events/1': event(),
    });
    visit('/events/1/attendance');

    expect(await screen.findByLabelText('Check-in code')).toHaveTextContent('K7Q2M9XP');
    expect(screen.getByTitle('Check-in QR code')).toBeInTheDocument();
    expect(await screen.findByText('1 of 2 present')).toBeInTheDocument();
    expect(within(screen.getByText('Bob Lim').closest('li')).getByText(/^Checked in/)).toBeInTheDocument();
    expect(within(screen.getByText('Alice Tan').closest('li')).getByText('Not checked in')).toBeInTheDocument();

    const aliceRow = screen.getByText('Alice Tan').closest('li');
    fireEvent.click(within(aliceRow).getByRole('button', { name: /mark present/i }));

    expect(await screen.findByText('2 of 2 present')).toBeInTheDocument();
    expect(JSON.parse(callsTo('PUT', '/volunteers/alice/attendance')[0][1].body)).toEqual({ attended: true });
  });

  test('scanning the QR code while logged out asks to log in, then checks in', async () => {
    mockApi({
      'POST /auth/authorize': { jwt: 'token-123', username: 'test', role: 'VOLUNTEER', fullName: 'Test Volunteer' },
      'POST /profile/events/1/check-in': { eventId: 1, eventName: 'Beach clean-up', hours: 3, verificationCode: 'abc-123', alreadyCheckedIn: false },
    });
    visit('/check-in/1?code=K7Q2M9XP');

    fireEvent.change(await screen.findByLabelText(/email or username/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('heading', { name: /you're checked in!/i })).toBeInTheDocument();
    expect(screen.getByText('3 hours')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view certificate/i })).toHaveAttribute('href', '/certificate/abc-123');
    expect(JSON.parse(callsTo('POST', '/check-in')[0][1].body)).toEqual({ code: 'K7Q2M9XP' });
    expect(callsTo('POST', '/check-in')).toHaveLength(1);
  });

  test('check-in explains why it failed', async () => {
    logIn('test');
    mockApi({ 'POST /profile/events/1/check-in': () => json({ message: 'Check-in opens an hour before the event starts' }, 409) });
    visit('/check-in/1?code=K7Q2M9XP');
    expect(await screen.findByRole('alert')).toHaveTextContent('Check-in opens an hour before the event starts');
  });

  test('my hours shows the verified total and links to certificates', async () => {
    logIn('test');
    mockApi({
      'GET /profile/me/hours': {
        totalHours: 5.5,
        entries: [
          { eventId: 1, eventName: 'Beach clean-up', organizerName: 'Green SG', fromDate: inDays(-7, 9), toDate: inDays(-7, 12), hours: 3, verificationCode: 'abc-123' },
          { eventId: 2, eventName: 'Reading club', organizerName: 'Tampines Library', fromDate: inDays(-14, 10), toDate: inDays(-14, 12), hours: 2.5, verificationCode: 'def-456' },
        ],
      },
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/me/hours');

    expect(await screen.findByText('5.5')).toBeInTheDocument();
    expect(screen.getByText('verified hours')).toBeInTheDocument();
    const certificateLinks = screen.getAllByRole('link', { name: 'Certificate' });
    expect(certificateLinks.map((a) => a.getAttribute('href'))).toEqual(['/certificate/abc-123', '/certificate/def-456']);
    // In the header and in the phone tab bar.
    expect(screen.getAllByRole('link', { name: 'My hours' }).length).toBeGreaterThan(0);
  });

  test('the public certificate shows the verified details', async () => {
    mockApi({
      'GET /profile/verify/abc-123': {
        volunteerName: 'Test Volunteer', eventName: 'Beach clean-up', organizerName: 'Green SG', hours: 3,
        fromDate: '2030-01-05T09:00:00', toDate: '2030-01-05T12:00:00', place: 'East Coast Park, Singapore 449876', verificationCode: 'abc-123',
      },
    });
    visit('/certificate/abc-123');

    expect(await screen.findByRole('heading', { name: 'Test Volunteer' })).toBeInTheDocument();
    expect(screen.getByText('Beach clean-up')).toBeInTheDocument();
    expect(screen.getByText('Green SG')).toBeInTheDocument();
    expect(screen.getByText(/verified by jointeer/i)).toBeInTheDocument();
    expect(screen.getByTitle('Verification QR code')).toBeInTheDocument();
  });

  test('an unknown certificate code is reported as not verified', async () => {
    mockApi({ 'GET /profile/verify/fake': () => json({ message: 'No verified record matches this code' }, 404) });
    visit('/certificate/fake');
    expect(await screen.findByRole('heading', { name: /couldn't verify this certificate/i })).toBeInTheDocument();
  });

  test('organizers get the attendance link on their event and no "My hours" link', async () => {
    logInAsOrganizer('org');
    mockApi({
      'GET /profile/events/1/volunteers': [],
      'GET /profile/events/1': event(),
      'GET /profile/me/events': { joined: [], organizing: [event()] },
    });
    visit('/events/1');
    expect(await screen.findByRole('link', { name: /attendance & check-in qr/i })).toHaveAttribute('href', '/events/1/attendance');
    expect(screen.queryByRole('link', { name: 'My hours' })).not.toBeInTheDocument();
  });
});

describe('finding and inviting volunteers', () => {
  const match = (overrides) => ({
    username: 'priya.nair', name: 'Priya N.', area: 'Tampines', interests: ['Environment'], verifiedHours: 12,
    eventsAttended: 4, causeEvents: 3, eventsWithYou: 2, status: null, ...overrides,
  });

  test('organizers find volunteers for their event and invite them', async () => {
    logInAsOrganizer();
    mockApi({
      'GET /profile/events/1': event({ id: 1 }),
      'GET /profile/categories': CATEGORIES,
      'GET /profile/volunteers/search': [
        match(),
        match({ username: 'marcus.lim', name: 'Marcus L.', area: 'Bedok', eventsWithYou: 0, causeEvents: 0, verifiedHours: 0, eventsAttended: 0 }),
        match({ username: 'wei.tan', name: 'Wei T.', status: 'JOINED', eventsWithYou: 0, causeEvents: 0 }),
      ],
      'POST /profile/events/1/invites': { invited: 2, skipped: 0, remaining: 28 },
    });
    visit('/events/1/invite');

    expect(await screen.findByText('Priya N.')).toBeInTheDocument();
    // Filters start from the event's cause, anywhere in Singapore.
    const search = callsTo('GET', '/profile/volunteers/search')[0][0];
    expect(search).toContain('eventId=1');
    expect(search).toContain('categoryId=1');
    expect(search).not.toContain('area=');
    expect(screen.getByText('Helped you 2 times')).toBeInTheDocument();
    expect(screen.getByText('3 Environment events')).toBeInTheDocument();
    expect(screen.getByText('New to volunteering on JoinTeer', { exact: false })).toBeInTheDocument();
    // Already going: can't be invited again.
    expect(screen.getByText('Going')).toBeInTheDocument();
    expect(screen.getByLabelText(/Wei T\./)).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    fireEvent.change(screen.getByLabelText(/add a note/i), { target: { value: 'Join us!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send 2 invitations' }));

    expect(await screen.findByText(/Sent 2 invitations\. You can invite 28 more/)).toBeInTheDocument();
    expect(JSON.parse(callsTo('POST', '/profile/events/1/invites')[0][1].body))
      .toEqual({ usernames: ['priya.nair', 'marcus.lim'], message: 'Join us!' });
  });

  test('experience and area filters narrow the search', async () => {
    logInAsOrganizer();
    mockApi({
      'GET /profile/events/1': event({ id: 1 }),
      'GET /profile/categories': CATEGORIES,
      'GET /profile/volunteers/search': [],
    });
    visit('/events/1/invite');

    expect(await screen.findByText(/No one matches yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/only people who've already done environment events/i));
    await screen.findByText(/No one matches yet/);
    fireEvent.change(screen.getByPlaceholderText(/^Anywhere/), { target: { value: 'Bedok' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await screen.findByText(/No one matches yet/);

    const last = callsTo('GET', '/profile/volunteers/search').pop()[0];
    expect(last).toContain('experienced=true');
    expect(last).toContain('area=Bedok');
  });

  test("organizers get an invite link on their event; other people's events send them back", async () => {
    logInAsOrganizer();
    mockApi({
      'GET /profile/events/1': event({ id: 1 }),
      'GET /profile/events/2': event({ id: 2, createdBy: 'someone-else' }),
      'GET /profile/events/1/volunteers': [],
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/events/1');
    expect(await screen.findByRole('link', { name: 'Invite volunteers' })).toHaveAttribute('href', '/events/1/invite');

    window.history.pushState({}, '', '/events/2/invite');
    fireEvent.popState(window);
    expect(await screen.findByRole('button', { name: /join as a volunteer/i })).toBeInTheDocument();
  });

  test('volunteers accept an invitation in one tap', async () => {
    logIn();
    const invite = { id: 7, event: event({ id: 3, name: 'Tree planting' }), organizerName: 'Green Singapore Community', message: "We'd love your help!" };
    mockApi({
      'GET /profile/me/events': { joined: [], organizing: [] },
      'GET /profile/me/invites': [invite],
      'POST /profile/me/invites/7/accept': event({ id: 3, name: 'Tree planting', volunteersJoined: 5 }),
    });
    visit('/me');

    expect(await screen.findByText('Green Singapore Community invited you')).toBeInTheDocument();
    expect(screen.getByText(/We'd love your help!/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: "I'm in" }));

    expect(await screen.findByText("You're in for Tree planting. See you there.")).toBeInTheDocument();
    expect(screen.queryByText('Green Singapore Community invited you')).not.toBeInTheDocument();
    expect(callsTo('GET', '/profile/me/events').length).toBe(2);
  });

  test('volunteers can decline and stop invitations from that organizer', async () => {
    logIn();
    mockApi({
      'GET /profile/me/events': { joined: [], organizing: [] },
      'GET /profile/me/invites': [{ id: 7, event: event({ id: 3 }), organizerName: 'Green Singapore Community', message: null }],
      'POST /profile/me/invites/7/decline': null,
    });
    visit('/me');

    fireEvent.click(await screen.findByRole('button', { name: 'Not this time' }));
    fireEvent.click(screen.getByLabelText("Don't send me invitations from Green Singapore Community"));
    fireEvent.click(screen.getByRole('button', { name: 'Decline invitation' }));

    expect(await screen.findByText(/Declined\./)).toBeInTheDocument();
    expect(JSON.parse(callsTo('POST', '/profile/me/invites/7/decline')[0][1].body)).toEqual({ muteOrganizer: true });
  });

  test('the home page mentions pending invitations and uses causes saved to the account', async () => {
    logIn();
    mockApi({
      'GET /profile/events': { content: [event(), event({ id: 2, name: 'Reading club', category: CATEGORIES[1] })] },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/events': { joined: [], organizing: [] },
      'GET /profile/me/preferences': { ...NO_PREFERENCES, interests: ['2'] },
      'GET /profile/me/invites': [{ id: 7, event: event({ id: 3 }), organizerName: 'Green SG', message: null }],
    });
    visit('/');

    expect(await screen.findByText('An organizer invited you to an event.')).toBeInTheDocument();
    const picked = (await screen.findByRole('heading', { name: /picked for you/i })).closest('section');
    expect(within(picked).getByText('Reading club')).toBeInTheDocument();
  });

  test('volunteers can allow a muted organizer again', async () => {
    logIn();
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'GET /profile/me/preferences': { ...NO_PREFERENCES, discoverable: true, mutedOrganizers: [{ username: 'org', name: 'Green SG' }] },
      'PUT /profile/me/preferences': (path, options) => json({ ...JSON.parse(options.body), mutedOrganizers: [] }),
      'GET /profile/events': { content: [] },
      'GET /profile/me/events': { joined: [], organizing: [] },
      'GET /profile/me/invites': [],
    });
    visit('/interests');

    fireEvent.click(await screen.findByRole('button', { name: 'Allow again' }));
    expect(screen.getByLabelText(/let organizers invite me/i)).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /save and show me events/i }));
    await screen.findByText(/Hi Full,/);
    expect(JSON.parse(callsTo('PUT', '/profile/me/preferences')[0][1].body).mutedOrganizers).toEqual([]);
  });
});

describe('GitHub Pages demo (no backend)', () => {
  const original = process.env.REACT_APP_DEMO;
  afterEach(() => { process.env.REACT_APP_DEMO = original; });

  test('shows the sample events and signs in with a demo account', async () => {
    process.env.REACT_APP_DEMO = 'true';
    localStorage.clear();
    global.fetch = jest.fn();
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(await screen.findByText('Beach clean-up at Pasir Ris')).toBeInTheDocument();
    expect(screen.getByText(/The events and people are made up/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Try a demo account' }));
    fireEvent.click(await screen.findByRole('button', { name: /Organizer/ }));
    expect(await screen.findByText('Green Singapore Community')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
