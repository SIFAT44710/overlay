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
        const res = await fetch('/api/auth', { cache: 'no-store' });
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
        setErrorMsg(data.error || 'ভুল পাসওয়ার্ড!');
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-hud text-white">
        <span className="w-4 h-4 rounded-full bg-purple-500 animate-ping" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-hud">
        <div className="w-full max-w-sm bg-slate-900/95 border border-purple-500/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-amber-400 to-teal-400" />

          <div className="flex justify-center mb-5 mt-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-xl">
              🔒
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-hud text-lg tracking-wider"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer text-sm"
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-base tracking-wider transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                '🔓'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
