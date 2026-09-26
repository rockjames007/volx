import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, saveSession } from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      saveSession(await login(form.username, form.password));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Email or username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required autoComplete="username" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
          {error && <p role="alert" className="text-red-600 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:bg-purple-600 hover:bg-purple-600 disabled:opacity-50">
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <div className="text-sm mt-4">
          Don't have an account? <Link to="/register" className="text-purple-500 hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
