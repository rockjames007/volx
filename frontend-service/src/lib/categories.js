// Visual identity for each cause. Class names are written out in full so Tailwind keeps them in the build.
const STYLES = {
  environment: { emoji: '🌱', pill: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', band: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-500 bg-emerald-50' },
  education: { emoji: '📚', pill: 'bg-sky-100 text-sky-800', bar: 'bg-sky-500', band: 'from-sky-500 to-blue-500', ring: 'ring-sky-500 bg-sky-50' },
  health: { emoji: '❤️', pill: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500', band: 'from-rose-500 to-pink-500', ring: 'ring-rose-500 bg-rose-50' },
  community: { emoji: '🤝', pill: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500', band: 'from-amber-500 to-orange-400', ring: 'ring-amber-500 bg-amber-50' },
  animals: { emoji: '🐾', pill: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', band: 'from-orange-500 to-amber-500', ring: 'ring-orange-500 bg-orange-50' },
  'disaster relief': { emoji: '🆘', pill: 'bg-red-100 text-red-800', bar: 'bg-red-500', band: 'from-red-500 to-rose-600', ring: 'ring-red-500 bg-red-50' },
};

const DEFAULT_STYLE = { emoji: '✨', pill: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500', band: 'from-violet-600 to-indigo-500', ring: 'ring-violet-500 bg-violet-50' };

export const categoryStyle = (name) => STYLES[name?.toLowerCase()] || DEFAULT_STYLE;
