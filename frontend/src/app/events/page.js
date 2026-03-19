'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch {
      alert('Failed to delete event');
    }
  };

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];
  const filteredEvents = events.filter(e =>
    filter === 'all' ? true : e.category?.toLowerCase() === filter.toLowerCase()
  );
  const isUpcoming = (date) => new Date(date) > new Date();

  const catMeta = {
    Technical:  { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  bar: 'bg-blue-500',   dot: 'bg-blue-500' },
    Cultural:   { color: 'text-pink-600',   bg: 'bg-pink-50',   border: 'border-pink-200',  bar: 'bg-pink-500',   dot: 'bg-pink-500' },
    Sports:     { color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200', bar: 'bg-green-500',  dot: 'bg-green-500' },
    Workshop:   { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',bar: 'bg-orange-500', dot: 'bg-orange-500' },
    Seminar:    { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200',bar: 'bg-violet-500', dot: 'bg-violet-500' },
    Conference: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200',bar: 'bg-indigo-500', dot: 'bg-indigo-500' },
    Other:      { color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200', bar: 'bg-slate-400',  dot: 'bg-slate-400' },
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-slate-500 text-sm mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/events/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">{error}</div>
        )}

        <div className="flex gap-8">

          {/* ── LEFT SIDEBAR — Filters ── */}
          <div className="w-56 flex-shrink-0 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Filter by Category</p>
            {categories.map((cat) => {
              const meta = catMeta[cat] || catMeta['Other'];
              const isAll = cat === 'all';
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    active
                      ? isAll
                        ? 'bg-slate-900 text-white shadow-md'
                        : `${meta.bg} ${meta.color} border ${meta.border} shadow-sm`
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {!isAll && (
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                  )}
                  {isAll && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )}
                  {cat === 'all' ? 'All Events' : cat}
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                    active
                      ? isAll ? 'bg-white/20 text-white' : `${meta.color} bg-white`
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat === 'all'
                      ? events.length
                      : events.filter(e => e.category === cat).length}
                  </span>
                </button>
              );
            })}

            {/* Divider + Link to analytics */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <Link href="/analytics"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analytics
              </Link>
              <Link href="/recommendations"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Insights
              </Link>
            </div>
          </div>

          {/* ── RIGHT — Event List ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">
                  {filter === 'all' ? 'No events yet' : `No ${filter} events`}
                </h3>
                <p className="text-slate-500 mb-7">
                  {filter === 'all' ? 'Create your first event to get started.' : 'Try a different category.'}
                </p>
                {filter === 'all' && (
                  <Link href="/events/create"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create your first event
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const upcoming = isUpcoming(event.start_date);
                  const meta = catMeta[event.category] || catMeta['Other'];

                  return (
                    <div key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden flex">

                      {/* Colored left accent bar */}
                      <div className={`w-1.5 flex-shrink-0 ${meta.bar}`} />

                      {/* Content */}
                      <div className="flex items-center gap-6 px-7 py-6 flex-1 min-w-0">

                        {/* Category icon */}
                        <div className={`w-14 h-14 ${meta.bg} border ${meta.border} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-7 h-7 ${meta.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-900 text-lg truncate">{event.title}</h3>
                            <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}>
                              {event.category || 'General'}
                            </span>
                            <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              upcoming ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {upcoming ? '● Upcoming' : '● Past'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm line-clamp-1 mb-3">
                            {event.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right — participant count + actions */}
                        <div className="flex items-center gap-5 flex-shrink-0">
                          <div className="text-center hidden sm:block">
                            <p className="text-2xl font-extrabold text-slate-900">{event.participant_count || 0}</p>
                            <p className="text-slate-400 text-xs">participants</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Link href={`/events/${event.id}`}
                              className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap text-center">
                              View Details
                            </Link>
                            {event.organizer_id === user.id && (
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-5 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-200 hover:border-red-200">
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
