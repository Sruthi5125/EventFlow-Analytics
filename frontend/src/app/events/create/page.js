'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function CreateEventPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    location: '',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/events', formData);
      router.push('/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-300">New Event</span>
          </div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-slate-400 mt-1">Fill in the details to publish your event</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {error && (
            <div className="mx-8 mt-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-7">
            {/* Title */}
            <div>
              <label className={labelClass}>
                Event Title <span className="text-red-400 font-normal">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Annual Tech Conference 2026"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={inputClass}
                placeholder="Describe your event — agenda, topics, what attendees can expect..."
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Conference">Conference</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  Start Date & Time <span className="text-red-400 font-normal">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>
                  End Date & Time <span className="text-red-400 font-normal">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Main Auditorium, Building A Room 101, or Online"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                {loading ? 'Creating event...' : 'Create Event'}
              </button>
              <Link
                href="/events"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
