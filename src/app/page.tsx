'use client';

import React from 'react';
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';

interface SlideItem {
  id: number;
  badge: string;
  title: string;
  desc: string;
  tag: string;
  color: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: 'Slide 01',
    title: 'Match 1–5 Points Race',
    desc: 'SVG multi-line race progression tracking top squads with glowing end tags and Drive team logo badges.',
    tag: 'Points Race',
    color: '#fbbf24',
  },
  {
    id: 2,
    badge: 'Slide 02',
    title: 'Team Head to Head',
    desc: 'Pure black semi-circle clash gauge with laser scanner needle, collision shockwave, and exact numbers.',
    tag: 'Team H2H',
    color: '#8b5cf6',
  },
  {
    id: 3,
    badge: 'Slide 03',
    title: 'Weapon Meta Rings',
    desc: 'Concentric target rings with center crown emblem, damage meters, and headshot ratios.',
    tag: 'Weapon Meta',
    color: '#2dd4bf',
  },
  {
    id: 4,
    badge: 'Slide 04',
    title: 'Team H2H Match 5',
    desc: 'Dynamic 4-corner diamond radar recalculating all 4 vertices from Team A vs Team B stats.',
    tag: 'Team H2H',
    color: '#ec008c',
  },
  {
    id: 5,
    badge: 'Slide 05',
    title: 'Group Stage Averages',
    desc: 'Dual concentric ring gauges comparing Elims, Damage, and Survival minutes between 2 teams.',
    tag: 'Averages',
    color: '#8b5cf6',
  },
  {
    id: 6,
    badge: 'Slide 06',
    title: 'Single-Candle Dynamic Column',
    desc: '72px bottom hex team logos with 22px tag names, live energy glow, and full numbers (zero K).',
    tag: 'Column Chart',
    color: '#F5B700',
  },
  {
    id: 7,
    badge: 'Slide 07',
    title: 'Top 2 / H2H Fast Radar',
    desc: 'Expanding polygon rings with glowing vertex halos and 64px team badges.',
    tag: 'Fast Radar',
    color: '#e11d48',
  },
  {
    id: 8,
    badge: 'Slide 08',
    title: 'M1–M5 Kills & DMG Line',
    desc: 'Dual-axis line chart tracking total kills (gold) and damage (sky blue) across Match 1 to 5.',
    tag: 'Dual Line',
    color: '#38bdf8',
  },
  {
    id: 9,
    badge: 'Slide 09',
    title: 'Role Dual Polar',
    desc: 'Two side-by-side polar area charts analyzing Rusher, Support, Sniper, and Bomber roles.',
    tag: 'Dual Polar',
    color: '#facc15',
  },
  {
    id: 10,
    badge: 'Slide 10',
    title: 'Dual-Candle Comparison Column',
    desc: '72px bottom hex team logos with dual comparison bars (Kills vs Damage, Survival vs Kills).',
    tag: 'Dual Column',
    color: '#F5B700',
  },
];

export default function Home() {
  const handleLogout = async () => {
    if (confirm('Broadcast suite theke logout korben?')) {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.reload();
    }
  };

  return (
    <AuthGate onLogout={handleLogout}>
      <main className="min-h-screen bg-[#0a0c16] text-white p-4 sm:p-8 font-hud">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8 border-b border-purple-500/30 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-xs font-bold uppercase tracking-wider text-black">
                vMix / OBS Production Suite
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Google Sheets & Drive Sync
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
              RTB / Free Fire Esports Broadcast Suite
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl font-sans">
              1080p transparent broadcast overlays with real-time polling every 2.5s. Click any overlay below for vMix input, or enter the Locked Admin Panel.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>⚙</span> Admin Control Panel
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950 border border-rose-500/50 hover:border-rose-400 text-rose-300 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              title="Logout and lock suite"
            >
              <span>🔒</span> লক করুন
            </button>
          </div>
        </header>

        {/* Overlays Grid */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="group relative bg-slate-900/60 border border-purple-500/25 hover:border-purple-400/80 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${slide.color}25`,
                        color: slide.color,
                        border: `1px solid ${slide.color}50`,
                      }}
                    >
                      {slide.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{slide.tag}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                    {slide.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">Route: /{slide.id}</div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${slide.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-800/80 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all flex items-center gap-1.5"
                    >
                      <span>📺</span> Open Overlay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
