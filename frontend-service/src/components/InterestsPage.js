import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCategories } from '../api';
import { useAuth } from '../lib/auth';
import { CauseIcon } from '../lib/categories';
import { getInterests, saveInterests } from '../lib/interests';
import Icon from './Icon';
import Layout from './Layout';

// Onboarding: pick the causes you care about, so the home page can suggest matching events.
function InterestsPage() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(() => new Set(getInterests(username)));

  useEffect(() => {
    getCategories().then((list) => setCategories(list || [])).catch(() => {});
  }, []);

  if (!username) {
    return <Navigate to="/login" replace state={{ from: '/interests' }} />;
  }

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveInterests(username, [...selected]);
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">What causes do you care about?</h1>
        <p className="text-kopi-700 mt-2">Pick as many as you like. We'll use them to suggest events for you — you can change them any time.</p>
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
          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={() => navigate('/')} className="text-sm text-kopi-700 hover:text-kopi-900">Skip for now</button>
            <button type="submit" className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-6 py-3 rounded-xl">
              {selected.size ? `Show me events (${selected.size})` : 'Show me events'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default InterestsPage;
