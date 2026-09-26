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
  address: { area: 'Marina Beach', state: 'Tamil Nadu' },
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

const logIn = (username = 'test') => {
  localStorage.setItem('volx.token', 'token-123');
  localStorage.setItem('volx.username', username);
};

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

    expect(screen.getByRole('heading', { name: /give your time where it matters/i })).toBeInTheDocument();
    expect(await screen.findByText('Beach clean-up')).toBeInTheDocument();
    expect(screen.getByText('6 of 10 spots left')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('volunteer spots open').previousSibling).toHaveTextContent('6');
    expect(screen.getByRole('heading', { name: /how volx works/i })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /all causes/i }));
    fireEvent.change(screen.getByPlaceholderText(/search by cause/i), { target: { value: 'marina' } });
    expect(screen.getAllByText(/Marina Beach/).length).toBe(2);
    fireEvent.change(screen.getByPlaceholderText(/search by cause/i), { target: { value: 'zzz' } });
    expect(screen.getByText('No events match your search.')).toBeInTheDocument();
  });

  test('shows a friendly message when events cannot be loaded', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    visit('/');
    expect(await screen.findByText(/couldn't load events right now/i)).toBeInTheDocument();
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

    expect(await screen.findByRole('button', { name: /i'll volunteer/i })).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole('button', { name: /i'll volunteer/i }));
    expect(await screen.findByText(/you're going!/i)).toBeInTheDocument();
    expect(screen.getByText('5 of 10 spots left')).toBeInTheDocument();
    expect(callsTo('POST', '/profile/events/1/volunteers')[0][1].headers.Authorization).toBe('Bearer token-123');

    fireEvent.click(screen.getByRole('button', { name: /can't make it/i }));
    expect(await screen.findByRole('button', { name: /i'll volunteer/i })).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole('button', { name: /i'll volunteer/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This event is full');
  });

  test('a full event cannot be joined, and organizers see their own status', async () => {
    logIn('org');
    mockApi({
      'GET /profile/events/1': event({ volunteersJoined: 10 }),
      'GET /profile/me/events': { joined: [], organizing: [event()] },
    });
    visit('/events/1');
    expect(await screen.findByText(/you're organizing this event/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /i'll volunteer/i })).not.toBeInTheDocument();
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

    expect(await screen.findByText(/welcome back, test/i)).toBeInTheDocument();
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
      'POST /auth/register': { jwt: 'token-123', username: 'newbie', expiresIn: 3600000 },
      'GET /profile/categories': CATEGORIES,
      'GET /profile/events': { content: [] },
      'GET /profile/me/events': { joined: [], organizing: [] },
    });
    visit('/register');

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newbie' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newbie@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    fireEvent.click(await screen.findByRole('button', { name: /environment/i }));
    fireEvent.click(screen.getByRole('button', { name: /show me events \(1\)/i }));

    expect(await screen.findByText(/welcome back, newbie/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('volx.interests.newbie'))).toEqual(['1']);
  });

  test('my events lists what the user signed up for and organizes', async () => {
    logIn();
    mockApi({
      'GET /profile/me/events': { joined: [event()], organizing: [event({ id: 7, name: 'Blood drive' })] },
    });
    visit('/me');

    expect(await screen.findByText('Beach clean-up')).toBeInTheDocument();
    expect(screen.getByText("You're going")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /organizing/i }));
    expect(screen.getByText('Blood drive')).toBeInTheDocument();
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
  };

  test('redirects to login when logged out', () => {
    visit('/events/new');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  test('publishes the event and opens its page', async () => {
    logIn();
    mockApi({
      'GET /profile/categories': CATEGORIES,
      'POST /profile/events': event({ id: 10, noOfParticipant: 15, volunteersJoined: 0 }),
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
    });
  });

  test('shows validation errors from the server', async () => {
    logIn();
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
    logIn();
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
