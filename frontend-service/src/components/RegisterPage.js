import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../lib/auth';
import AuthShell, { inputClass, labelClass } from './AuthShell';

const ACCOUNT_TYPES = [
  { value: 'VOLUNTEER', title: 'I want to volunteer', text: 'Find causes and join events.', emoji: '🙋' },
  { value: 'ORGANIZER', title: 'I organize events', text: 'Post events for a charity, school or group.', emoji: '📣' },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [form, setForm] = useState({
    role: searchParams.get('type') === 'organizer' ? 'ORGANIZER' : 'VOLUNTEER',
    fullName: '',
    organizationName: '',
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isOrganizer = form.role === 'ORGANIZER';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Your name is required';
    if (isOrganizer && !form.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      signIn(await register({
        username: form.username,
        email: form.email,
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
        organizationName: isOrganizer ? form.organizationName.trim() : null,
      }));
      // Volunteers pick their causes; organizers go straight to posting their first event.
      navigate(isOrganizer ? '/events/new' : '/interests');
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  const fieldError = (name) => errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>;

  return (
    <AuthShell title="Become a JoinTeer" subtitle="Create an account in less than a minute.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className={labelClass}>Account type</legend>
          <div className="grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map((type) => {
              const active = form.role === type.value;
              return (
                <label key={type.value}
                       className={`cursor-pointer rounded-xl border p-3 transition ${active ? 'border-violet-600 ring-2 ring-violet-600 bg-violet-50' : 'border-slate-300 hover:border-slate-400'}`}>
                  <input type="radio" name="role" value={type.value} checked={active} onChange={handleChange} className="sr-only" />
                  <span className="block text-xl" aria-hidden="true">{type.emoji}</span>
                  <span className="block font-semibold text-sm mt-1">{type.title}</span>
                  <span className="block text-xs text-slate-600">{type.text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div>
          <label htmlFor="fullName" className={labelClass}>Full name</label>
          <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" className={inputClass} aria-describedby="fullName-hint" />
          {fieldError('fullName') || <p id="fullName-hint" className="text-xs text-slate-500 mt-1">{isOrganizer ? 'The contact person for your events.' : 'Shown on your volunteering certificates.'}</p>}
        </div>
        {isOrganizer && (
          <div>
            <label htmlFor="organizationName" className={labelClass}>Organization name</label>
            <input id="organizationName" name="organizationName" value={form.organizationName} onChange={handleChange} autoComplete="organization" placeholder="e.g. Green Singapore Community" className={inputClass} />
            {fieldError('organizationName')}
          </div>
        )}
        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} autoComplete="username" className={inputClass} />
          {fieldError('username')}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" className={inputClass} />
          {fieldError('email')}
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" className={inputClass} aria-describedby="password-hint" />
          {fieldError('password') || <p id="password-hint" className="text-xs text-slate-500 mt-1">At least 6 characters.</p>}
        </div>
        {errors.form && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.form}</p>}
        <button type="submit" disabled={submitting} className="w-full font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-3 rounded-xl disabled:opacity-50">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-6">
        Already have an account? <Link to="/login" className="font-semibold text-violet-700 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
