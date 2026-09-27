import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isDemo, login } from '../api';
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

  const logIn = async (username, password) => {
    setError('');
    setSubmitting(true);
    try {
      signIn(await login(username, password));
      // Send people back to what they were doing, e.g. the event they wanted to join.
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    logIn(form.username, form.password);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your events and sign up to help.">
      {isDemo() && (
        <section aria-labelledby="demo-accounts" className="mb-6 rounded-xl border border-kaya-200 bg-kaya-50 p-4">
          <h2 id="demo-accounts" className="font-semibold text-kopi-900">Try a demo account</h2>
          <p className="text-sm text-kopi-700 mt-1">No sign-up needed. Pick one to look around.</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <button type="button" disabled={submitting} onClick={() => logIn('test', 'test123')}
                    className="text-left rounded-lg border border-sand-300 bg-white px-3 py-2 hover:border-sambal-700 disabled:opacity-50">
              <span className="block font-semibold text-kopi-900">Volunteer</span>
              <span className="block text-sm text-kopi-600">test / test123</span>
            </button>
            <button type="button" disabled={submitting} onClick={() => logIn('org', 'org123')}
                    className="text-left rounded-lg border border-sand-300 bg-white px-3 py-2 hover:border-sambal-700 disabled:opacity-50">
              <span className="block font-semibold text-kopi-900">Organizer</span>
              <span className="block text-sm text-kopi-600">org / org123</span>
            </button>
          </div>
        </section>
      )}
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
