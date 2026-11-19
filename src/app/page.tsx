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
    badge: 'Slide 1',
    title: 'Top 12 Elims & Damage Trend',
    desc: 'Dual-axis leaderboard with vertical kill bars and smooth damage trend line with team logos.',
    tag: 'Overall Standings',
    color: '#F5B700',
  },
  {
    id: 2,
    badge: 'Slide 2',
    title: 'Double Bar Comparison',
    desc: 'Grouped side-by-side kill and damage comparison bars for top contenders.',
    tag: 'Kills & Damage',
    color: '#6225A6',
  },
  {
    id: 3,
    badge: 'Slide 3',
    title: 'Matrix 3-Line Grid',
    desc: 'Three-metric trend line comparing Kill Points, Survival Score, and Total Damage.',
    tag: 'Multi-Metric',
    color: '#00DF82',
  },
  {
    id: 4,
    badge: 'Slide 4',
    title: 'Multi-Team Radar Matrix',
    desc: 'Five-axis polygon radar visualizing team tactical balance and frag potential.',
    tag: 'Radar Analytics',
    color: '#EC008C',
  },
  {
    id: 5,
    badge: 'Slide 5',
    title: 'Match Breakdown Multi-Line',
    desc: 'Round-by-round point progression tracking championship race momentum.',
    tag: 'Progression',
    color: '#7C3AED',
  },
  {
    id: 6,
    badge: 'Slide 6',
    title: 'Survival vs Kills Polar Matrix',
    desc: 'Circular polar comparison mapping team aggression against survival discipline.',
    tag: 'Polar Matrix',
    color: '#6225A6',
  },
  {
    id: 7,
    badge: 'Slide 7',
    title: 'Head-to-Head Clash Gauge',
    desc: 'Direct head-to-head showdown gauge comparing 2 top squads with duel metrics.',
    tag: 'Team Duel',
    color: '#004B87',
  },
  {
    id: 8,
    badge: 'Slide 8',
    title: 'Total Points Column (12 Teams)',
    desc: 'Vertical race bars with count-up numbers, rank #1 gold highlight, and square team badges.',
    tag: '12-Team Race',
    color: '#F5B700',
  },
  {
    id: 9,
    badge: 'Slide 9',
    title: 'Top 4 Sequential Radar',
    desc: 'Unfolding sequential radar with gold-first animation, pulsing halos, and axis reveals.',
    tag: 'Top 4 Radar',
    color: '#6225A6',
  },
  {
    id: 10,
    badge: 'Slide 10',
    title: 'Team H2H Slanted Butterfly',
    desc: 'Dark Navy vs Purple slanted nameplates with fire sparks and 6 butterfly comparison bars.',
    tag: 'Team H2H Sparks',
    color: '#111827',
  },
  {
    id: 11,
    badge: 'Slide 11',
    title: '1v1 Clash Semi-Circle Gauge',
    desc: 'Player 1 White plate vs Player 2 Purple plate, semi-circle clash gauge with scanner and 4 slanted ratio bars.',
    tag: '1v1 Clash Gauge',
    color: '#EC008C',
  },
  {
    id: 12,
    badge: 'Slide 12',
    title: 'Weapons Meta Concentric Rings',
    desc: 'Concentric circular progress rings for weapons with weapon stat cards and damage breakdown.',
    tag: 'Weapons Meta',
    color: '#00DF82',
  },
];

export default function Home() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyUrl = (id: number) => {
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#111827] text-white p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191a] via-[#1f1a30] to-[#111827] border-2 border-black p-6 sm:p-10 shadow-[8px_8px_0px_#000]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6225A6]/30 border border-[#7C3AED] text-[#F5B700] text-xs font-bold font-num uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00DF82] animate-ping" />
                Live Broadcast Graphics Suite
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-title uppercase tracking-wide text-white">
                Free Fire Tournament Overlays
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                12 transparent, broadcast-ready overlays engineered for OBS Studio and vMix. Synced in real time with Google Sheets and customizable on the fly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/admin"
                className="px-6 py-3.5 rounded-2xl bg-[#6225A6] hover:bg-[#7C3AED] text-white font-bold font-title text-base uppercase tracking-wider transition border-2 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2"
              >
                <span>🎨 Color Palette Studio</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F5B700] text-black font-num font-black">
                  /admin
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* OBS Setup Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-black/60 border border-slate-700/60 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <span className="text-base">📺</span>
            <span>
              <strong>OBS / vMix Recommended Source:</strong> Width <strong>1920</strong>, Height <strong>1080</strong>, FPS <strong>60</strong>. Canvas is 100% transparent.
            </span>
          </div>
          <span className="text-amber-400 font-num font-bold">12 Live Overlays Available</span>
        </div>

        {/* Overlays Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#18191a] border-2 border-black p-5 shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#6225A6] transition duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-md text-xs font-black font-num border border-black"
                    style={{
                      backgroundColor: slide.color,
                      color: slide.color === '#F5B700' ? '#000000' : '#ffffff',
                    }}
                  >
                    {slide.badge}
                  </span>
                  <span className="text-[11px] font-bold font-num uppercase tracking-wider text-slate-400">
                    {slide.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-title text-white group-hover:text-[#F5B700] transition">
                  {slide.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {slide.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                <Link
                  href={`/${slide.id}`}
                  target="_blank"
                  className="flex-1 py-2.5 rounded-xl bg-[#6225A6] hover:bg-[#7C3AED] text-white text-xs font-bold font-title uppercase tracking-wider text-center transition border border-black shadow-[2px_2px_0px_#000]"
                >
                  Open Overlay ↗
                </Link>
                <button
                  type="button"
                  onClick={() => copyUrl(slide.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] text-slate-200 hover:text-white text-xs font-bold font-num transition border border-slate-700"
                  title="Copy OBS Browser Source URL"
                >
                  {copiedId === slide.id ? '✓ Copied' : 'Copy URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
