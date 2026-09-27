import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCategories, getPreferences, savePreferences } from '../api';
import { useAuth } from '../lib/auth';
import { CauseIcon } from '../lib/categories';
import { getInterests, saveInterests } from '../lib/interests';
import AvailabilityGrid from './AvailabilityGrid';
import Icon from './Icon';
import Layout from './Layout';

const inputClass = 'w-full h-12 px-4 rounded-xl border border-sand-300 bg-white text-kopi-900 placeholder-kopi-600 focus:border-sambal-700 focus:outline-none';

// Onboarding and settings: the causes you care about, where you'd like to help, and whether organizers may
// invite you. Recommendations use the causes; organizers' volunteer search uses all three.
function InterestsPage() {
  const navigate = useNavigate();
  const { username, isOrganizer } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(() => new Set(getInterests(username)));
  const [area, setArea] = useState('');
  const [availability, setAvailability] = useState(new Set());
  const [discoverable, setDiscoverable] = useState(false);
  const [muted, setMuted] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then((list) => setCategories(list || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!username || isOrganizer) return;
    getPreferences()
      .then((preferences) => {
        // Causes picked before they were saved to the account (kept in this browser) carry over.
        if (preferences.interests.length) setSelected(new Set(preferences.interests));
        setArea(preferences.area || '');
        setAvailability(new Set(preferences.availability || []));
        setDiscoverable(preferences.discoverable);
        setMuted(preferences.mutedOrganizers || []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [username, isOrganizer]);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: '/interests' }} />;
  }
  if (isOrganizer) {
    return <Navigate to="/" replace />;
  }

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await savePreferences({
        interests: [...selected].map(Number),
        area,
        availability: [...availability],
        discoverable,
        mutedOrganizers: muted.map((organizer) => organizer.username),
      });
      saveInterests(username, [...selected]);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">What causes do you care about?</h1>
        <p className="text-kopi-700 mt-2">Pick as many as you like. We'll use them to suggest events for you. You can change them any time.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2 mt-8" role="group" aria-label="Causes">
            {categories.map((category) => {
              const id = String(category.id);
              const active = selected.has(id);
              return (
                <button type="button" key={id} onClick={() => toggle(id)} aria-pressed={active}
                        className={`flex items-start gap-3 text-left p-4 rounded-xl border transition ${active ? 'border-sambal-700 ring-2 ring-sambal-700 bg-sambal-50' : 'bg-white border-sand-300 hover:border-kopi-600'}`}>
                  <CauseIcon name={category.category} className="w-7 h-7 shrink-0" />
                  <span className="flex-1">
                    <span className="block font-semibold">{category.category}</span>
                    <span className="block text-sm text-kopi-700">{category.categoryDescription}</span>
                  </span>
                  {active && <Icon name="check" className="w-5 h-5 text-sambal-700" />}
                </button>
              );
            })}
          </div>

          <div className="mt-10">
            <label htmlFor="area" className="block font-semibold text-kopi-900">Where would you like to help?</label>
            <p className="text-sm text-kopi-700 mt-1">Your neighbourhood, or anywhere that's easy for you to get to.</p>
            <input id="area" value={area} onChange={(e) => setArea(e.target.value)} maxLength={60}
                   placeholder="e.g. Tampines" className={`${inputClass} mt-3 max-w-sm`} />
          </div>

          <div className="mt-10">
            <h2 className="font-semibold text-kopi-900 text-base">When are you usually free?</h2>
            <p className="text-sm text-kopi-700 mt-1">
              Tap the times that usually work for you. Organizers only ever see totals, like "18 volunteers are free on
              Saturday mornings", so they can pick dates that suit more people.
            </p>
            <div className="mt-3 max-w-xl">
              <AvailabilityGrid selected={availability} onChange={setAvailability} disabled={!loaded} />
            </div>
          </div>

          <fieldset className="mt-10 rounded-xl border border-sand-200 bg-white p-5">
            <legend className="sr-only">Invitations from organizers</legend>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={discoverable} onChange={(e) => setDiscoverable(e.target.checked)}
                     disabled={!loaded} className="mt-1 w-5 h-5 accent-sambal-700 shrink-0" />
              <span>
                <span className="block font-semibold text-kopi-900">Let organizers invite me to events</span>
                <span className="block text-sm text-kopi-700 mt-1">
                  Organizers looking for help can find you and send you an invitation here on JoinTeer.
                  They see your first name and last initial, your area, your causes and your verified hours,
                  never your email or phone number. You can turn this off any time.
                </span>
              </span>
            </label>
            {muted.length > 0 && (
              <div className="mt-5 border-t border-sand-100 pt-4">
                <p className="text-sm font-semibold text-kopi-900">You don't get invitations from</p>
                <ul className="mt-2 space-y-2">
                  {muted.map((organizer) => (
                    <li key={organizer.username} className="flex items-center justify-between gap-3 text-sm">
                      <span>{organizer.name}</span>
                      <button type="button" onClick={() => setMuted(muted.filter((m) => m.username !== organizer.username))}
                              className="font-semibold text-sambal-700 hover:underline">Allow again</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </fieldset>

          {error && <p role="alert" className="mt-6 text-sm text-chilli-700 bg-chilli-50 border border-chilli-100 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={() => navigate('/')} className="text-kopi-700 hover:text-kopi-900">Skip for now</button>
            <button type="submit" disabled={saving} className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-6 py-3 rounded-xl disabled:opacity-50">
              {saving ? 'Saving…' : 'Save and show me events'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default InterestsPage;
