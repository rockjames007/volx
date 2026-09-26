import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../lib/auth';
import AuthShell, { inputClass, labelClass } from './AuthShell';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
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
      signIn(await login(form.username, form.password));
      // Send people back to what they were doing, e.g. the event they wanted to join.
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your events and sign up to help.">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="username" className={labelClass}>Email or username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required autoComplete="username" className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" className={inputClass} />
        </div>
        {error && <p role="alert" className="text-sm text-chilli-700 bg-chilli-50 border border-chilli-100 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-4 py-3 rounded-xl disabled:opacity-50">
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="text-sm text-kopi-700 mt-6">
        New to JoinTeer? <Link to="/register" state={location.state} className="font-semibold text-sambal-700 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export default LoginPage;
