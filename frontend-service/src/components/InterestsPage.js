import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCategories } from '../api';
import { useAuth } from '../lib/auth';
import { categoryStyle } from '../lib/categories';
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
        <h1 className="text-3xl font-extrabold tracking-tight">What causes do you care about?</h1>
        <p className="text-slate-600 mt-2">Pick as many as you like. We'll use them to suggest events for you — you can change them any time.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2 mt-8" role="group" aria-label="Causes">
            {categories.map((category) => {
              const id = String(category.id);
              const style = categoryStyle(category.category);
              const active = selected.has(id);
              return (
                <button type="button" key={id} onClick={() => toggle(id)} aria-pressed={active}
                        className={`flex items-start gap-3 text-left p-4 rounded-2xl border bg-white transition ${active ? `ring-2 ${style.ring} border-transparent` : 'border-slate-200 hover:border-slate-400'}`}>
                  <span className="text-2xl" aria-hidden="true">{style.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{category.category}</span>
                    <span className="block text-sm text-slate-600">{category.categoryDescription}</span>
                  </span>
                  {active && <Icon name="check" className="w-5 h-5 text-violet-700" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={() => navigate('/')} className="text-sm text-slate-600 hover:text-slate-900">Skip for now</button>
            <button type="submit" className="font-semibold text-white bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl">
              {selected.size ? `Show me events (${selected.size})` : 'Show me events'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default InterestsPage;
