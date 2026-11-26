'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data?.user || null);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const navItems = [
    { label: 'Curriculum', href: '/roadmap' },
    { label: 'Skill Tree', href: '/skill-tree' },
    { label: 'Practice', href: '/practice' },
    { label: 'Projects', href: '/projects' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
        >
          LearnPath AI
        </Link>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  active
                    ? 'text-white border-blue-500'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action or Authenticated Control */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/planner"
                className="text-sm font-medium text-slate-300 hover:text-white whitespace-nowrap shrink-0 transition-colors"
              >
                {currentUser.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#111827] px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-blue-600/15 text-blue-300'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Study Planner
          </Link>
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-medium rounded-lg border border-slate-700 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
