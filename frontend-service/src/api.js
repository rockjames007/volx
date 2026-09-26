const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const TOKEN_KEY = 'volx.token';
const USER_KEY = 'volx.username';
const PROFILE_KEY = 'volx.profile';
export const SESSION_EVENT = 'volx:session';

const notifySessionChange = () => window.dispatchEvent(new Event(SESSION_EVENT));

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USER_KEY);

// Account type, name and organization from the last login. Older sessions without it count as volunteers.
export const getProfile = () => {
  try {
    return { role: 'VOLUNTEER', ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') };
  } catch (e) {
    return { role: 'VOLUNTEER' };
  }
};

export const saveSession = ({ jwt, username, role, fullName, organizationName }) => {
  localStorage.setItem(TOKEN_KEY, jwt);
  localStorage.setItem(USER_KEY, username);
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ role: role || 'VOLUNTEER', fullName, organizationName }));
  notifySessionChange();
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
  notifySessionChange();
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Cannot reach the JoinTeer server. Is the API gateway running?');
  }

  const data = await response.json().catch(() => null);
  if (response.status === 401 && token) {
    // The stored token was rejected (e.g. expired): forget it so the user is asked to log in again.
    clearSession();
  }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }
  return data;
}

export const login = (username, password) =>
  request('/auth/authorize', { method: 'POST', body: { username, password } });

export const register = (account) => request('/auth/register', { method: 'POST', body: account });

export const getEvents = (page = 0, size = 50) =>
  request(`/profile/events?page=${page}&size=${size}&sort=fromDate`);

export const getCategories = () => request('/profile/categories');

export const createEvent = (event) => request('/profile/events', { method: 'POST', body: event });

export const getEvent = (id) => request(`/profile/events/${id}`);

export const joinEvent = (id) => request(`/profile/events/${id}/volunteers`, { method: 'POST' });

export const leaveEvent = (id) => request(`/profile/events/${id}/volunteers`, { method: 'DELETE' });

export const getMyEvents = () => request('/profile/me/events');

export const updateEvent = (id, event) => request(`/profile/events/${id}`, { method: 'PUT', body: event });

export const cancelEvent = (id) => request(`/profile/events/${id}/cancel`, { method: 'POST' });

export const getVolunteers = (id) => request(`/profile/events/${id}/volunteers`);

export const getCheckInCode = (id) => request(`/profile/events/${id}/check-in-code`);

export const checkIn = (id, code) => request(`/profile/events/${id}/check-in`, { method: 'POST', body: { code } });

export const updateAttendance = (id, username, attendance) =>
  request(`/profile/events/${id}/volunteers/${encodeURIComponent(username)}/attendance`, { method: 'PUT', body: attendance });

export const getMyHours = () => request('/profile/me/hours');

export const verifyCertificate = (code) => request(`/profile/verify/${encodeURIComponent(code)}`);

// Absolute link to a page of this site, e.g. for QR codes (works under a sub-path like /jointeer).
export const siteUrl = (path) => `${window.location.origin}${process.env.PUBLIC_URL || ''}${path}`;
