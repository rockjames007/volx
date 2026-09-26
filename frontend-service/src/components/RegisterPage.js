import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../lib/auth';
import AuthShell, { inputClass, labelClass } from './AuthShell';

function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
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
      signIn(await register(form.username, form.email, form.password));
      navigate('/interests');
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  const fieldError = (name) => errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>;

  return (
    <AuthShell title="Become a JoinTeer" subtitle="Create an account to start volunteering. It takes less than a minute.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
