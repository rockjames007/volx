import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const respond = (body, ok = true, status = 200) =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  global.fetch = jest.fn();
});

test('lists events returned by the API', async () => {
  fetch.mockReturnValueOnce(respond({ content: [{ id: 1, name: 'Beach clean-up', category: { category: 'Environment' } }] }));
  render(<App />);
  expect(await screen.findByText('Beach clean-up')).toBeInTheDocument();
  expect(fetch.mock.calls[0][0]).toMatch(/\/profile\/events\?/);
});

test('shows a helpful message when the API is unreachable', async () => {
  fetch.mockReturnValueOnce(Promise.reject(new TypeError('Failed to fetch')));
  render(<App />);
  expect(await screen.findByText(/Couldn't load events/)).toBeInTheDocument();
});

test('logging in stores the token and greets the user', async () => {
  window.history.pushState({}, '', '/login');
  fetch
    .mockReturnValueOnce(respond({ jwt: 'token-123', username: 'test', expiresIn: 3600000 }))
    .mockReturnValueOnce(respond({ content: [] }));
  render(<App />);

  fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'test@gmail.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(await screen.findByText('Hi, test')).toBeInTheDocument();
  expect(localStorage.getItem('volx.token')).toBe('token-123');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ username: 'test@gmail.com', password: 'test123' });
});

test('shows the server error on a failed login', async () => {
  window.history.pushState({}, '', '/login');
  fetch.mockReturnValueOnce(respond({ message: 'Invalid username or password' }, false, 401));
  render(<App />);

  fireEvent.change(screen.getByLabelText(/email or username/i), { target: { value: 'x' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'y' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
});

describe('creating an event', () => {
  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Beach clean-up' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/starts/i), { target: { value: '2030-01-05T09:00' } });
    fireEvent.change(screen.getByLabelText(/ends/i), { target: { value: '2030-01-05T12:00' } });
    fireEvent.change(screen.getByLabelText(/volunteers needed/i), { target: { value: '15' } });
  };

  beforeEach(() => {
    localStorage.setItem('volx.token', 'token-123');
    localStorage.setItem('volx.username', 'test');
    window.history.pushState({}, '', '/events/new');
  });

  test('redirects to login when logged out', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  test('submits the event with the token and returns to the listing', async () => {
    fetch
      .mockReturnValueOnce(respond([{ id: '3', category: 'Environment' }]))
      .mockReturnValueOnce(respond({ id: 10, name: 'Beach clean-up' }, true, 201))
      .mockReturnValueOnce(respond({ content: [{ id: 10, name: 'Beach clean-up', noOfParticipant: 15 }] }));
    render(<App />);
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByText('15 volunteers needed')).toBeInTheDocument();
    const [url, options] = fetch.mock.calls[1];
    expect(url).toMatch(/\/profile\/events$/);
    expect(options.headers.Authorization).toBe('Bearer token-123');
    expect(JSON.parse(options.body)).toMatchObject({
      name: 'Beach clean-up', categoryId: 3, fromDate: '2030-01-05T09:00', toDate: '2030-01-05T12:00', noOfParticipant: 15,
    });
  });

  test('shows validation errors from the server', async () => {
    fetch
      .mockReturnValueOnce(respond([{ id: '3', category: 'Environment' }]))
      .mockReturnValueOnce(respond({ message: 'fromDate: must be a future date' }, false, 400));
    render(<App />);
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('fromDate: must be a future date');
  });

  test('sends the user to log in again when the session has expired', async () => {
    fetch
      .mockReturnValueOnce(respond([{ id: '3', category: 'Environment' }]))
      .mockReturnValueOnce(respond({ message: 'Your session has expired, please log in again' }, false, 401));
    render(<App />);
    await screen.findByRole('option', { name: 'Environment' });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(localStorage.getItem('volx.token')).toBeNull();
  });
});
