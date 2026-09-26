import React from 'react';
import { CalendarCheck, HandHeart, SealCheck } from '@phosphor-icons/react';
import { Logo } from './Layout';

export const inputClass = 'w-full h-12 bg-white border-[1.5px] border-sand-300 rounded-xl px-4 text-kopi-900 placeholder-kopi-600 focus:outline-none focus:border-sambal-700 focus:ring-2 focus:ring-sambal-100';
export const labelClass = 'block font-semibold text-kopi-900 mb-1.5';

const REASONS = [
  { Icon: HandHeart, text: 'Find causes near you that you care about' },
  { Icon: CalendarCheck, text: 'Join in one tap, even for just two hours' },
  { Icon: SealCheck, text: 'Get verified hours for VIA, CVs and scholarships' },
];

// Split screen used by the log-in and sign-up pages: why JoinTeer on the left, the form on the right.
const AuthShell = ({ title, subtitle, children }) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between bg-kopi-900 text-rice-50 p-12">
      <Logo light />
      <div>
        <p className="font-display text-4xl font-semibold leading-tight max-w-md">
          Small pockets of time, done together, add up to a lot.
        </p>
        <ul className="mt-10 space-y-4 text-lg text-rice-100">
          {REASONS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="w-7 h-7 text-kaya-300 shrink-0" weight="duotone" aria-hidden="true" />{text}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-kopi-300">Volunteering across Singapore.</p>
    </div>
    <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-rice-50">
      <div className="w-full max-w-sm mx-auto">
        <div className="lg:hidden mb-8"><Logo /></div>
        <h1 className="text-3xl md:text-4xl font-semibold">{title}</h1>
        {subtitle && <p className="text-kopi-700 mt-2">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthShell;
