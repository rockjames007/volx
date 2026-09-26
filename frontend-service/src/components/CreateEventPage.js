import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createEvent, getCategories, getToken } from '../api';

const inputClass = 'w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500';
const labelClass = 'block text-gray-700 font-bold mb-2';

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
    state: '',
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
    return <Navigate to="/login" replace />;
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
      await createEvent({
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        noOfParticipant: form.noOfParticipant ? Number(form.noOfParticipant) : null,
        address: { area: form.area, state: form.state },
      });
      navigate('/');
    } catch (err) {
      if (!getToken()) {
        navigate('/login');
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-xl mx-4">
        <h2 className="text-3xl font-bold mb-6">Create an event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className={labelClass}>Event name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required maxLength={120} className={inputClass} />
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
            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} maxLength={2000} className={inputClass} />
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
              <label htmlFor="area" className={labelClass}>Area / venue</label>
              <input id="area" name="area" value={form.area} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="state" className={labelClass}>State</label>
              <input id="state" name="state" value={form.state} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="noOfParticipant" className={labelClass}>Volunteers needed</label>
            <input type="number" min="1" id="noOfParticipant" name="noOfParticipant" value={form.noOfParticipant} onChange={handleChange} className={inputClass} />
          </div>
          {error && <p role="alert" className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <Link to="/" className="text-purple-500 hover:underline">Cancel</Link>
            <button type="submit" disabled={submitting} className="bg-purple-500 text-white font-bold py-2 px-6 rounded-md hover:bg-purple-600 disabled:opacity-50">
              {submitting ? 'Creating…' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
