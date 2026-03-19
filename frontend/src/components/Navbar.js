'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/events', label: 'Events' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/recommendations', label: 'AI Insights' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo + Nav links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-base tracking-tight hidden sm:block">EventIQ</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <div className="leading-tight">
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-slate-500 text-xs capitalize">{user?.role || 'organizer'}</p>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-700 hidden sm:block" />
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
