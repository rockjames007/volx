import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { createEvent, getCategories, getEvent, getToken, updateEvent } from '../api';
import { Megaphone } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';
import { inputClass, labelClass } from './AuthShell';
import Layout from './Layout';

// "2030-01-05T09:00:00" -> "2030-01-05T09:00", the format datetime-local inputs use.
const toInputValue = (value) => (value ? value.slice(0, 16) : '');

// Posts a new event, or edits one at /events/:id/edit.
const CreateEventPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const { isOrganizer } = useAuth();
  const pagePath = editing ? `/events/${id}/edit` : '/events/new';
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
  // When editing, the form only appears once the event has loaded, so nothing typed early gets overwritten.
  const [loaded, setLoaded] = useState(!editing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getToken() || !isOrganizer) return;
    getCategories()
      .then((list) => setCategories(list || []))
      .catch(() => setError('Could not load categories. Is the profile service running?'));
  }, [isOrganizer]);

  useEffect(() => {
    if (!editing || !getToken() || !isOrganizer) return;
    getEvent(id)
      .then((event) => {
        setForm({
          name: event.name || '',
          categoryId: event.category?.id ? String(event.category.id) : '',
          description: event.description || '',
          fromDate: toInputValue(event.fromDate),
          toDate: toInputValue(event.toDate),
          noOfParticipant: event.noOfParticipant ? String(event.noOfParticipant) : '',
          area: event.address?.area || '',
          postalCode: event.address?.pincode || '',
        });
        setLoaded(true);
      })
      .catch(() => setError("We couldn't load this event."));
  }, [editing, id, isOrganizer]);

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: pagePath }} />;
  }

  if (!isOrganizer) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-kopi-800" weight="duotone" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Posting events is for organizer accounts</h1>
          <p className="text-kopi-700 mt-2">
            Your account is set up for volunteering. If you run events for a charity, school or community group,
            create a separate organizer account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/" className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-5 py-2.5 rounded-xl">Find events to join</Link>
          </div>
        </div>
      </Layout>
    );
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
      const details = {
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        noOfParticipant: form.noOfParticipant ? Number(form.noOfParticipant) : null,
        address: { area: form.area, pincode: form.postalCode || null, country: 'Singapore' },
      };
      const saved = editing ? await updateEvent(id, details) : await createEvent(details);
      navigate(`/events/${saved.id}`);
    } catch (err) {
      if (!getToken()) {
        navigate('/login', { state: { from: pagePath } });
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
        <h1 className="text-3xl font-semibold tracking-tight">{editing ? 'Edit event' : 'Post an event'}</h1>
        <p className="text-kopi-700 mt-2 mb-8">
          {editing ? 'Volunteers who already joined will see the updated details.' : 'Tell volunteers what you need help with. Clear details get more sign-ups.'}
        </p>
        {!loaded && !error && <p className="text-kopi-600">Loading event…</p>}
        {!loaded && error && <p role="alert" className="text-chilli-700">{error}</p>}
        {loaded && (
        <div className="bg-white border border-sand-200 rounded-xl shadow-sm p-6 sm:p-8">
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
            <p className="text-sm text-kopi-600 -mt-1 mb-1.5">Leave empty if anyone can join.</p>
            <input type="number" min="1" id="noOfParticipant" name="noOfParticipant" value={form.noOfParticipant} onChange={handleChange} className={inputClass} />
          </div>
          {error && <p role="alert" className="text-sm text-chilli-700 bg-chilli-50 border border-chilli-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <Link to={editing ? `/events/${id}` : '/'} className="text-sm text-kopi-700 hover:text-kopi-900">{editing ? 'Back to event' : 'Cancel'}</Link>
            <button type="submit" disabled={submitting} className="font-semibold text-white bg-sambal-700 hover:bg-sambal-800 px-6 py-3 rounded-xl disabled:opacity-50">
              {submitting ? (editing ? 'Saving…' : 'Publishing…') : (editing ? 'Save changes' : 'Create event')}
            </button>
          </div>
        </form>
        </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateEventPage;
