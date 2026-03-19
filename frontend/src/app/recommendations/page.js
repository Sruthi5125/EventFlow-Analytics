'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5001';

const steps = [
  {
    key: 'best_day',
    num: '01',
    icon: '📅',
    title: 'Best Day to Schedule',
    sub: 'Optimal day of week for maximum attendance',
    accent: 'border-blue-500',
    numBg: 'bg-blue-600',
    highlight: 'bg-blue-50 border-blue-100',
    metricColor: 'text-blue-600',
  },
  {
    key: 'best_category',
    num: '02',
    icon: '🎯',
    title: 'Best Event Category',
    sub: 'Category that consistently drives highest attendance',
    accent: 'border-emerald-500',
    numBg: 'bg-emerald-600',
    highlight: 'bg-emerald-50 border-emerald-100',
    metricColor: 'text-emerald-600',
  },
  {
    key: 'best_timing',
    num: '03',
    icon: '🕐',
    title: 'Optimal Time Slot',
    sub: 'Time of day that brings the highest turnout',
    accent: 'border-violet-500',
    numBg: 'bg-violet-600',
    highlight: 'bg-violet-50 border-violet-100',
    metricColor: 'text-violet-600',
  },
  {
    key: 'engagement',
    num: '04',
    icon: '📈',
    title: 'Engagement Insights',
    sub: 'Conversion rate analysis and actionable tips',
    accent: 'border-orange-500',
    numBg: 'bg-orange-600',
    highlight: 'bg-orange-50 border-orange-100',
    metricColor: 'text-orange-600',
    metrics: [
      { key: 'conversion_rate', label: 'Conversion Rate', suffix: '%' },
      { key: 'total_views',       label: 'Total Views',    suffix: '' },
      { key: 'total_participants', label: 'Participants',  suffix: '' },
    ],
  },
  {
    key: 'demographics',
    num: '05',
    icon: '👥',
    title: 'Audience Demographics',
    sub: 'Age profile and audience targeting insights',
    accent: 'border-pink-500',
    numBg: 'bg-pink-600',
    highlight: 'bg-pink-50 border-pink-100',
    metricColor: 'text-pink-600',
    metrics: [
      { key: 'average_age',        label: 'Average Age',  suffix: ' yrs' },
      { key: 'total_participants',  label: 'Sample Size', suffix: '' },
    ],
  },
];

function ConfidencePill({ confidence }) {
  const map = {
    high:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low:    'bg-slate-100 text-slate-500 border-slate-200',
  };
  const bars = { high: 3, medium: 2, low: 1 }[confidence] ?? 1;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${map[confidence] ?? map.low}`}>
      {[...Array(3)].map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < bars ? 'opacity-100' : 'opacity-20'}`}
          style={{ background: 'currentColor' }} />
      ))}
      {(confidence || 'low').charAt(0).toUpperCase() + (confidence || 'low').slice(1)}
    </span>
  );
}

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${ML_API_URL}/recommendations/${user.id}`);
      setRecommendations(response.data);
    } catch (err) {
      setError(err.code === 'ERR_NETWORK' ? 'service_offline' : 'load_failed');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
            <p className="text-slate-500 text-sm mt-0.5">5-step data-driven recommendations for your events</p>
          </div>
          {!loading && !error && (
            <button onClick={fetchRecommendations}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Analyzing your event data...</p>
          </div>

        ) : error === 'service_offline' ? (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-14 text-center">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-3">AI service is offline</h3>
            <p className="text-slate-500 mb-7">Start the ML service with this command:</p>
            <div className="bg-slate-900 rounded-xl px-6 py-4 text-left mb-8">
              <p className="text-slate-500 text-xs font-mono mb-1">terminal</p>
              <p className="text-green-400 text-sm font-mono">cd ml-service &amp;&amp; python app.py</p>
            </div>
            <button onClick={fetchRecommendations}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Try again
            </button>
          </div>

        ) : error === 'load_failed' ? (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-14 text-center">
            <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-3">Failed to load</h3>
            <p className="text-slate-500 mb-7">Something went wrong. Please try again.</p>
            <button onClick={fetchRecommendations}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Retry
            </button>
          </div>

        ) : recommendations ? (
          <div className="flex gap-8">

            {/* ── LEFT: Step navigator ── */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
                <div className="px-6 py-5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insights</p>
                </div>
                <nav className="p-3">
                  {steps.map((step, i) => {
                    const data = recommendations[step.key];
                    return (
                      <button
                        key={step.key}
                        onClick={() => setActiveStep(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all mb-1 ${
                          activeStep === i
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          activeStep === i ? 'bg-white/20 text-white' : `${step.numBg} text-white`
                        }`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{step.title}</p>
                          {data && (
                            <p className={`text-xs mt-0.5 ${activeStep === i ? 'text-white/60' : 'text-slate-400'} capitalize`}>
                              {data.confidence} confidence
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="px-6 py-4 border-t border-slate-100">
                  <Link href="/events/create"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Apply & Create Event
                  </Link>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Stepper content ── */}
            <div className="flex-1 min-w-0 space-y-5">
              {steps.map((step, i) => {
                const data = recommendations[step.key];
                if (!data) return null;
                const isActive = activeStep === i;

                return (
                  <div key={step.key}
                    onClick={() => setActiveStep(i)}
                    className={`bg-white rounded-2xl border shadow-sm transition-all cursor-pointer overflow-hidden ${
                      isActive ? `border-l-4 ${step.accent} border-slate-200 shadow-lg` : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                    }`}>

                    {/* Card header (always visible) */}
                    <div className="flex items-center gap-5 px-8 py-6">
                      <div className={`w-14 h-14 ${step.numBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-slate-400">{step.num}</span>
                          <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                        </div>
                        <p className="text-slate-500 text-sm">{step.sub}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <ConfidencePill confidence={data.confidence} />
                        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isActive ? 'rotate-90' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isActive && (
                      <div className={`px-8 pb-8 border-t border-slate-100 pt-6 ${step.highlight} border-0`}>
                        <div className={`rounded-xl border p-5 mb-5 ${step.highlight}`}>
                          <p className={`font-bold text-lg ${step.metricColor}`}>{data.recommendation}</p>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-6">{data.details}</p>

                        {/* Metrics grid (only engagement & demographics) */}
                        {step.metrics && data.metrics && (
                          <div className={`grid grid-cols-${step.metrics.length} gap-4`}>
                            {step.metrics.map(({ key, label, suffix }) => (
                              <div key={key} className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
                                <p className={`text-3xl font-extrabold ${step.metricColor} mb-1`}>
                                  {data.metrics[key]}{suffix}
                                </p>
                                <p className="text-slate-500 text-sm">{label}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Nav buttons */}
                        <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200">
                          {i > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); setActiveStep(i - 1); }}
                              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Previous
                            </button>
                          )}
                          {i < steps.length - 1 && (
                            <button onClick={(e) => { e.stopPropagation(); setActiveStep(i + 1); }}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors ml-auto">
                              Next insight
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-2">No recommendations yet</h3>
            <p className="text-slate-500 mb-7">Create more events to unlock AI-powered insights.</p>
            <Link href="/events/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              Create an event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
