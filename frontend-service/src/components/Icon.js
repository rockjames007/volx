import React from 'react';
import {
  ArrowLeft, CalendarBlank, Check, Clock, List, MagnifyingGlass, MapPin, Plus, SealCheck, User, UsersThree, X,
} from '@phosphor-icons/react';

// Interface icons (Phosphor, "regular" weight). Always pair an icon with a word, except for universal actions.
const ICONS = {
  arrowLeft: ArrowLeft,
  calendar: CalendarBlank,
  check: Check,
  clock: Clock,
  close: X,
  menu: List,
  pin: MapPin,
  plus: Plus,
  search: MagnifyingGlass,
  user: User,
  users: UsersThree,
  verified: SealCheck,
};

const Icon = ({ name, className = 'w-5 h-5', weight = 'regular' }) => {
  const Component = ICONS[name];
  return <Component className={className} weight={weight} aria-hidden="true" />;
};

export default Icon;
