'use client';

import React, { useState, useEffect } from 'react';

interface AuthGateProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check current session cookie via GET /api/auth
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json().catch(() => ({}));
        if (isMounted) {
          setIsAuthenticated(data.authenticated === true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setErrorMsg(data.error || 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-hud text-white">
        <div className="flex items-center gap-3 text-lg font-bold">
          <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping"></span>
          অ্যাডমিন সেশন ভেরিফাই হচ্ছে...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-hud">
        <div className="w-full max-w-md bg-slate-900/90 border border-purple-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-amber-400 to-teal-400"></div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-2xl mb-3 shadow-inner">
              🔒
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              BROADCAST SUITE ACCESS
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-sans">
              RTB / Free Fire Esports Broadcast Suite (Password Protected)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-purple-300 font-bold mb-1.5 flex justify-between">
                <span>অ্যাডমিন পাসওয়ার্ড লিখুন</span>
                <span className="text-[11px] text-amber-300 font-normal">Default: admin123</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-hud text-lg tracking-wider"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer text-sm"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-base sm:text-lg tracking-wider transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  আনলক হচ্ছে...
                </>
              ) : (
                'আনলক করুন 🔓'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest">
              Live vMix Overlays (/1..10) do not require password
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
