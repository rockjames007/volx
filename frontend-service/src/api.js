const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const TOKEN_KEY = 'volx.token';
const USER_KEY = 'volx.username';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USER_KEY);

export const saveSession = ({ jwt, username }) => {
  localStorage.setItem(TOKEN_KEY, jwt);
  localStorage.setItem(USER_KEY, username);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
    throw new Error('Cannot reach the Volx server. Is the API gateway running?');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }
  return data;
}

export const login = (username, password) =>
  request('/auth/authorize', { method: 'POST', body: { username, password } });

export const register = (username, email, password) =>
  request('/auth/register', { method: 'POST', body: { username, email, password } });

export const getEvents = (page = 0, size = 12) =>
  request(`/profile/events?page=${page}&size=${size}&sort=fromDate`);
