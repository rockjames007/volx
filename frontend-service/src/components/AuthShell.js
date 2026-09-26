import React from 'react';
import { Logo } from './Layout';

export const inputClass = 'w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';
export const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5';

// Split screen used by the log-in and sign-up pages: the mission on the left, the form on the right.
const AuthShell = ({ title, subtitle, children }) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-white text-slate-900">
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white p-12">
      <Logo light />
      <div>
        <p className="text-3xl font-extrabold leading-tight">“The best way to find yourself is to lose yourself in the service of others.”</p>
        <p className="mt-3 text-violet-200">— Mahatma Gandhi</p>
      </div>
      <ul className="space-y-2 text-violet-100">
        <li>🌱 Find causes that match what you care about</li>
        <li>🤝 Sign up for local events in one click</li>
        <li>📅 Keep track of everywhere you're helping</li>
      </ul>
    </div>
    <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
      <div className="w-full max-w-sm mx-auto">
        <div className="lg:hidden mb-8"><Logo /></div>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthShell;
