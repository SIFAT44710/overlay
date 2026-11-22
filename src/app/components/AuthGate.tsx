'use client';

import React, { useState, useEffect } from 'react';

interface AuthGateProps {
  children: React.ReactNode;
  pageTitle?: string;
  badge?: string;
}

export default function AuthGate({
  children,
  pageTitle = 'Broadcast Console',
  badge = 'SECURITY GATEWAY',
}: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check HttpOnly session cookie on mount via GET /api/auth
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsAuthenticated(data.authenticated === true);
        }
      })
      .catch(() => {
        if (isMounted) setIsAuthenticated(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড লিখুন!');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.authorized) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setErrorMsg(data.error || 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
      }
    } catch {
      setErrorMsg('সার্ভার যাচাইকরণ ব্যর্থ হয়েছে। ইন্টারনেট বা কনফিগ চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLock = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setPassword('');
    setErrorMsg(null);
  };

  // While determining session status on mount
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated, render protected children + floating lock button
  if (isAuthenticated) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleLock}
          className="fixed bottom-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-[#242526] hover:bg-[#3a3b3c] border border-[#3a3b3c] text-xs font-bold text-[#b0b3b8] hover:text-white shadow-xl transition flex items-center gap-1.5 cursor-pointer backdrop-blur"
          title="Lock Console"
        >
          <span>🔒</span>
          <span>Lock</span>
        </button>
        {children}
      </div>
    );
  }

  // Lock Screen View
  return (
    <div className="min-h-screen w-full bg-[#18191a] text-[#e4e6eb] flex items-center justify-center p-4 select-none font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1877f2]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#242526] border border-[#3a3b3c] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-hud text-[11px] font-black uppercase tracking-wider text-amber-400">
              {badge}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#b0b3b8] font-hud uppercase">
            Demo-Graph BD
          </span>
        </div>

        {/* Padlock Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#18191a] border border-[#3a3b3c] mx-auto flex items-center justify-center text-2xl shadow-inner mb-4 text-amber-400">
            🔒
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Screen Locked / স্ক্রিন লক
          </h1>
          <p className="text-xs text-[#b0b3b8] mt-1.5">
            {pageTitle} অ্যাক্সেস করতে সঠিক পাসওয়ার্ড প্রবেশ করান
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#b0b3b8] mb-1.5 font-hud uppercase tracking-wider">
              Enter Passkey / পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="পাসওয়ার্ড লিখুন..."
                autoFocus
                className="w-full bg-[#18191a] border border-[#3a3b3c] focus:border-[#1877f2] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1 cursor-pointer font-bold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>Unlock Screen</span>
                <span>🔓</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#3a3b3c] text-center">
          <p className="text-[11px] text-[#b0b3b8]">
            OBS / vMix Direct Overlays: <span className="text-white font-bold font-mono">/1</span> to <span className="text-white font-bold font-mono">/14</span> require zero password.
          </p>
        </div>
      </div>
    </div>
  );
}
