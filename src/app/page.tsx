'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
    title: 'FFWS Wipe Standing (Top 12)',
    desc: '6-column tactical leaderboard with live points, short tags, team logos, and flame aura.',
    tag: 'Overall Standings',
    color: '#F5B700',
  },
  {
    id: 2,
    badge: 'Slide 02',
    title: 'Match 1–5 Points Race',
    desc: 'SVG multi-line race progression tracking top squads with glowing end tags (#1 TOP 134 PTS).',
    tag: 'Progression',
    color: '#8B5CF6',
  },
  {
    id: 3,
    badge: 'Slide 03',
    title: '1v1 Player Clash Gauge',
    desc: 'Contender 1 vs 2 clash gauge with scanner needle, shockwave burst, and sequential stat reveal.',
    tag: '1v1 Clash',
    color: '#E11D48',
  },
  {
    id: 4,
    badge: 'Slide 04',
    title: 'Weapon Meta Rings',
    desc: 'Concentric target rings with center META badge, damage meters, and headshot ratios.',
    tag: 'Weapon Meta',
    color: '#2DD4BF',
  },
  {
    id: 7,
    badge: 'Slide 07',
    title: 'Team H2H Match 5 (Radar + Gauge)',
    desc: '4-axis tactical diamond radar on left + semi-circle duel clash gauge on right.',
    tag: 'Team H2H',
    color: '#6366F1',
  },
  {
    id: 8,
    badge: 'Slide 08',
    title: 'Team H2H Day Butterfly',
    desc: '6-metric horizontal butterfly comparison bars between top 2 championship rivals.',
    tag: 'Butterfly Duel',
    color: '#EC008C',
  },
  {
    id: 9,
    badge: 'Slide 09',
    title: 'Group Stage Averages',
    desc: '3 metric cards with dual concentric SVG rings for Avg Elims, Damage, and Survival time.',
    tag: 'Group Stage',
    color: '#8B5CF6',
  },
  {
    id: 10,
    badge: 'Slide 10',
    title: 'Match 5 MVP Spotlight',
    desc: 'MVP spotlight with semi-circle On-Target Accuracy Gauge, live counter, and player tag.',
    tag: 'MVP Spotlight',
    color: '#FBBF24',
  },
  {
    id: 11,
    badge: 'Slide 11',
    title: 'Total Points Column',
    desc: '12 vertical bounce bars with team short tags, logos, count-up points, and flame aura.',
    tag: '12-Team Race',
    color: '#F5B700',
  },
  {
    id: 12,
    badge: 'Slide 12',
    title: 'Top 2 Cinematic Slow Radar',
    desc: 'Slow cinematic radar reveal with concentric rings lock-in, #2 entrance, then #1 sweep.',
    tag: 'Cinematic Radar',
    color: '#E11D48',
  },
  {
    id: 13,
    badge: 'Slide 13',
    title: 'M1–M5 Kills & DMG Line',
    desc: 'Dual Y-axis line chart tracking Match 1 to 5 Total Kills vs Total Damage with smooth curves.',
    tag: 'Progression Trend',
    color: '#38BDF8',
  },
  {
    id: 14,
    badge: 'Slide 14',
    title: 'Role Avg Dual Polar',
    desc: 'Dual polar area diagrams comparing Avg Kills and Avg Damage across 4 player roles.',
    tag: 'Role Polar',
    color: '#2DD4BF',
  },
  {
    id: 5,
    badge: 'Slide 05',
    title: 'Role Warfare Donut (Queued Later)',
    desc: 'Tactical role breakdown donut (Rusher, Support, Sniper, Bomber) with animated center total kills.',
    tag: 'Role Warfare',
    color: '#38BDF8',
  },
  {
    id: 6,
    badge: 'Slide 06',
    title: 'Match 5 Map Standing (Queued Later)',
    desc: 'Top 10 map standings with dual survival and kill bars, Booyah winner badge, and team tags.',
    tag: 'Map Standing',
    color: '#10B981',
  },
];

export default function HomePage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyUrl = (id: number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] p-6 sm:p-10 font-sans">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#3a3b3c] pb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-hud text-xs font-black uppercase tracking-widest text-emerald-400">
              LIVE BROADCAST SUITE • 14 SLIDES
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
            Free Fire Broadcast Graphics Engine
          </h1>
          <p className="text-sm text-[#b0b3b8] mt-1">
            Google Sheets Synchronized • Transparent OBS Fire Overlays • Dynamic Color Studio
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Admin Color Studio
          </Link>
          <a
            href="https://docs.google.com/spreadsheets/d/1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] text-white border border-[#3a3b3c] font-bold text-sm shadow transition-all flex items-center gap-2"
          >
            Google Sheet (Live Data)
          </a>
        </div>
      </header>

      {/* Grid of 14 Slides */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="bg-[#242526] rounded-2xl border border-[#3a3b3c] p-6 shadow-xl flex flex-col justify-between hover:border-[#1877f2] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black font-hud text-black"
                  style={{ backgroundColor: slide.color }}
                >
                  {slide.badge}
                </span>
                <span className="text-[11px] font-bold text-[#b0b3b8] uppercase tracking-wider font-hud">
                  {slide.tag}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white group-hover:text-[#1877f2] transition-colors">
                {slide.title}
              </h2>
              <p className="text-sm text-[#b0b3b8] mt-2 line-clamp-2 leading-relaxed">
                {slide.desc}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-[#3a3b3c] flex items-center gap-2">
              <Link
                href={`/${slide.id}`}
                target="_blank"
                className="flex-1 py-2 text-center rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Open Slide ↗
              </Link>
              <button
                type="button"
                onClick={() => copyUrl(slide.id)}
                className="px-4 py-2 rounded-xl bg-[#1877f2]/15 hover:bg-[#1877f2]/30 text-[#1877f2] font-bold text-xs uppercase tracking-wider transition-all border border-[#1877f2]/30"
              >
                {copiedId === slide.id ? 'Copied!' : 'Copy OBS URL'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
