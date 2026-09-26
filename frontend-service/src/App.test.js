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
