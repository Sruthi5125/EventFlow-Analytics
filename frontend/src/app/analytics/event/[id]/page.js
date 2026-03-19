'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function EventAnalyticsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchEventAnalytics();
    }
  }, [user, params.id]);

  const fetchEventAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, eventRes] = await Promise.all([
        api.get(`/analytics/event/${params.id}`),
        api.get(`/events/${params.id}`)
      ]);
      setAnalytics(analyticsRes.data);
      setEvent(eventRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Event Analytics</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600">
              Events
            </Link>
            <Link href="/analytics" className="text-gray-700 hover:text-blue-600">
              Analytics
            </Link>
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/analytics" className="text-blue-600 hover:underline">
            ← Back to Analytics
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : event && analytics ? (
          <>
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
              <div className="flex gap-4 text-gray-600">
                <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                <span>📍 {event.location || 'TBA'}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {event.category || 'General'}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Total Views</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.views || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Registrations</p>
                <p className="text-3xl font-bold text-green-600">{analytics.registrations || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.views > 0 
                    ? ((analytics.registrations / analytics.views) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Over Time */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Activity Over Last 7 Days</h3>
                {analytics.activityOverTime && analytics.activityOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.activityOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" name="Activity" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No activity data yet</p>
                  </div>
                )}
              </div>

              {/* Age Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Participant Age Distribution</h3>
                {analytics.ageDistribution && analytics.ageDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.ageDistribution}
                        dataKey="count"
                        nameKey="age_group"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {analytics.ageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No participant data yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Event not found</p>
          </div>
        )}
      </div>
    </div>
  );
}