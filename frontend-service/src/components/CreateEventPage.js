import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createEvent, getCategories, getToken } from '../api';
import { inputClass, labelClass } from './AuthShell';
import Layout from './Layout';


const CreateEventPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    fromDate: '',
    toDate: '',
    noOfParticipant: '',
    area: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    getCategories()
      .then((list) => setCategories(list || []))
      .catch(() => setError('Could not load categories. Is the profile service running?'));
  }, []);

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: '/events/new' }} />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.toDate <= form.fromDate) {
      setError('The end must be after the start.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createEvent({
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        noOfParticipant: form.noOfParticipant ? Number(form.noOfParticipant) : null,
        address: { area: form.area, pincode: form.postalCode || null, country: 'Singapore' },
      });
      navigate(`/events/${created.id}`);
    } catch (err) {
      if (!getToken()) {
        navigate('/login', { state: { from: '/events/new' } });
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Post an event</h1>
        <p className="text-slate-600 mt-2 mb-8">Tell volunteers what you need help with. Clear details get more sign-ups.</p>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className={labelClass}>Event name</label>
            <input id="name" name="name" placeholder="e.g. Saturday beach clean-up" value={form.name} onChange={handleChange} required maxLength={120} className={inputClass} />
          </div>
          <div className="mb-4">
            <label htmlFor="categoryId" className={labelClass}>Category</label>
            <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required className={inputClass}>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.category}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" placeholder="What will volunteers do? What should they bring?" name="description" value={form.description} onChange={handleChange} rows={4} maxLength={2000} className={inputClass} />
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fromDate" className={labelClass}>Starts</label>
              <input type="datetime-local" id="fromDate" name="fromDate" value={form.fromDate} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="toDate" className={labelClass}>Ends</label>
              <input type="datetime-local" id="toDate" name="toDate" value={form.toDate} onChange={handleChange} required min={form.fromDate} className={inputClass} />
            </div>
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="area" className={labelClass}>Venue</label>
              <input id="area" name="area" value={form.area} onChange={handleChange} placeholder="e.g. East Coast Park, Area C" className={inputClass} />
            </div>
            <div>
              <label htmlFor="postalCode" className={labelClass}>Postal code</label>
              <input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} inputMode="numeric"
                     pattern="\d{6}" maxLength={6} title="Singapore postal codes have 6 digits" placeholder="e.g. 449876" className={inputClass} />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="noOfParticipant" className={labelClass}>Volunteers needed</label>
            <p className="text-xs text-slate-500 -mt-1 mb-1.5">Leave empty if anyone can join.</p>
            <input type="number" min="1" id="noOfParticipant" name="noOfParticipant" value={form.noOfParticipant} onChange={handleChange} className={inputClass} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">Cancel</Link>
            <button type="submit" disabled={submitting} className="font-semibold text-white bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl disabled:opacity-50">
              {submitting ? 'Publishing…' : 'Create event'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEventPage;
