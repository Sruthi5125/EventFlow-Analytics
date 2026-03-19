'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
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

  const engagementRate = stats?.totalViews > 0
    ? ((stats.totalParticipants / stats.totalViews) * 100).toFixed(1)
    : '0.0';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    { href: '/events/create', label: 'Create New Event', sub: 'Plan your next event', color: 'bg-blue-600 hover:bg-blue-700', icon: 'M12 4v16m8-8H4' },
    { href: '/events',        label: 'Browse Events',    sub: 'Manage all events',    color: 'bg-emerald-600 hover:bg-emerald-700', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { href: '/analytics',     label: 'View Analytics',   sub: 'Performance metrics',  color: 'bg-violet-600 hover:bg-violet-700', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { href: '/recommendations',label: 'AI Insights',     sub: 'Smart suggestions',    color: 'bg-slate-700 hover:bg-slate-800', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Top: Welcome + Inline Stats Bar ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-10 py-8">
                <p className="text-blue-300 text-sm font-medium">{greeting}</p>
                <h1 className="text-3xl font-bold text-white mt-1">{user.name}</h1>
                <p className="text-slate-400 text-sm mt-1">Here&apos;s a snapshot of your event activity.</p>
              </div>

              {/* Inline stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
                {[
                  { label: 'Total Events',  value: stats?.totalEvents ?? 0,      color: 'text-blue-600',   bg: 'bg-blue-50',   icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: 'Participants',  value: stats?.totalParticipants ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                  { label: 'Total Views',   value: stats?.totalViews ?? 0,        color: 'text-violet-600', bg: 'bg-violet-50', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                  { label: 'Engagement',    value: `${engagementRate}%`,           color: 'text-orange-600', bg: 'bg-orange-50', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} className={`px-8 py-7 ${bg} flex items-center gap-5`}>
                    <div className="bg-white rounded-xl shadow-sm p-3 flex-shrink-0">
                      <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                      <p className="text-slate-600 text-sm font-medium mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT — Recent Events (takes 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Recent Events</h2>
                      <p className="text-slate-400 text-sm">Your latest event activity</p>
                    </div>
                    <Link href="/events" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                      See all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {stats?.recentEvents?.length ? (
                    <div className="divide-y divide-slate-100">
                      {stats.recentEvents.map((event, i) => (
                        <Link key={event.id} href={`/events/${event.id}`}
                          className="flex items-center gap-6 px-8 py-5 hover:bg-slate-50 transition-colors group">
                          {/* Step number */}
                          <div className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {event.title}
                              </p>
                              <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                {event.category || 'General'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm">
                              {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-xl font-bold text-slate-900">{event.participant_count || 0}</p>
                              <p className="text-slate-400 text-xs">attendees</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-8 py-16 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium">No events yet</p>
                      <p className="text-slate-400 text-sm mt-1">Create your first event to see it here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT — Quick Actions sidebar */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Quick Actions</h2>
                {quickActions.map(({ href, label, sub, color, icon }) => (
                  <Link key={href} href={href}
                    className={`${color} text-white rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 block`}>
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">{label}</p>
                      <p className="text-white/60 text-sm mt-0.5">{sub}</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
