'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    if (!stats?.eventsByCategory?.length) return [];
    return stats.eventsByCategory.map(item => ({
      name: item.category || 'Other',
      value: parseInt(item.count) || 0,
    }));
  };

  const getEventsData = () => {
    if (!stats?.recentEvents?.length) return [];
    return stats.recentEvents.map(event => ({
      name: event.title.length > 14 ? event.title.substring(0, 14) + '…' : event.title,
      Participants: parseInt(event.participant_count) || 0,
    }));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryData = getCategoryData();
  const eventsData = getEventsData();
  const engagementRate = stats?.totalViews > 0
    ? ((stats.totalParticipants / stats.totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Performance overview across all your events</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">{error}</div>
        </div>
      ) : stats ? (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

          {/* ── HERO metric strip ── */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

              {/* Featured big metric */}
              <div className="lg:col-span-1 px-10 py-10 flex flex-col justify-center">
                <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">Engagement Rate</p>
                <p className="text-7xl font-black text-white">{engagementRate}<span className="text-4xl text-blue-300">%</span></p>
                <p className="text-slate-400 text-sm mt-3">Visitor-to-participant conversion</p>
              </div>

              {/* Supporting 3 stats */}
              {[
                { label: 'Total Events',  value: stats.totalEvents ?? 0,      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-blue-400' },
                { label: 'Participants',  value: stats.totalParticipants ?? 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-400' },
                { label: 'Total Views',   value: stats.totalViews ?? 0,        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-violet-400' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="px-10 py-10 flex flex-col justify-center">
                  <svg className={`w-8 h-8 ${color} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                  <p className="text-5xl font-extrabold text-white">{value}</p>
                  <p className="text-slate-400 text-sm mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Charts: full-width bar + pie side by side ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Bar chart — takes 2/3 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Participant Breakdown</h3>
                  <p className="text-slate-400 text-sm">Attendance per event</p>
                </div>
              </div>
              {eventsData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventsData} barSize={44}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="Participants" radius={[8, 8, 0, 0]}>
                        {eventsData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No data yet</p>
                </div>
              )}
            </div>

            {/* Pie chart — takes 1/3 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 text-lg">By Category</h3>
                <p className="text-slate-400 text-sm">Events distribution</p>
              </div>
              {categoryData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name"
                        cx="50%" cy="45%" outerRadius={85} innerRadius={42}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Events']} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  <p>No categories yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Full-width events table ── */}
          {stats.recentEvents?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Event Breakdown</h3>
                  <p className="text-slate-400 text-sm">Detailed view of recent events</p>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['#', 'Event Name', 'Category', 'Date', 'Participants', ''].map(h => (
                      <th key={h} className="text-left py-4 px-7 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentEvents.map((event, i) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-7">
                        <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-bold">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-5 px-7 font-semibold text-slate-900">{event.title}</td>
                      <td className="py-5 px-7">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {event.category || 'General'}
                        </span>
                      </td>
                      <td className="py-5 px-7 text-slate-500 text-sm">
                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-5 px-7">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-extrabold text-slate-900">{event.participant_count || 0}</span>
                          {/* Mini progress bar */}
                          <div className="flex-1 max-w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, (event.participant_count / Math.max(...stats.recentEvents.map(e => e.participant_count || 1))) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-7 text-right">
                        <Link href={`/events/${event.id}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm whitespace-nowrap">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <p className="text-slate-500">No analytics data available yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
