'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function EventDetailPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchEvent();
    }
  }, [user, params.id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${params.id}`);
      setEvent(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      await api.post(`/events/${params.id}/register`, formData);
      setRegisterSuccess('Successfully registered for the event!');
      setFormData({ name: '', email: '', age: '' });
      setShowRegisterForm(false);
      
      // Refresh event data to update participant count
      setTimeout(() => {
        fetchEvent();
        setRegisterSuccess('');
      }, 2000);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegisterLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/events" className="text-blue-600 hover:underline">
            ← Back to Events
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {registerSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {registerSuccess}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event...</p>
          </div>
        ) : event ? (
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    {event.category || 'General'}
                  </span>
                </div>
                {event.organizer_id === user.id && (
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Edit Event
                  </Link>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <p className="font-semibold text-gray-700">Description</p>
                    <p className="text-gray-600">{event.description || 'No description provided'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <p className="font-semibold text-gray-700">Date & Time</p>
                    <p className="text-gray-600">
                      {new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <p className="font-semibold text-gray-700">Location</p>
                    <p className="text-gray-600">{event.location || 'To be announced'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-2xl mr-3">👤</span>
                  <div>
                    <p className="font-semibold text-gray-700">Organized by</p>
                    <p className="text-gray-600">{event.organizer_name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-semibold text-gray-700">Participants</p>
                    <p className="text-gray-600">{event.participant_count || 0} registered</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 flex gap-4">
                <button
                  onClick={() => setShowRegisterForm(!showRegisterForm)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                >
                  {showRegisterForm ? 'Hide Registration Form' : 'Register for Event'}
                </button>
                <Link
                  href={`/analytics/event/${event.id}`}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
                >
                  View Analytics
                </Link>
              </div>
            </div>

            {/* Registration Form */}
            {showRegisterForm && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-bold mb-6">Register for Event</h3>

                {registerError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {registerError}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={registerLoading}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      disabled={registerLoading}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Age (optional)
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                      max="120"
                      disabled={registerLoading}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:bg-green-300"
                    >
                      {registerLoading ? 'Registering...' : 'Complete Registration'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegisterForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Event not found</p>
          </div>
        )}
      </div>
    </div>
  );
}