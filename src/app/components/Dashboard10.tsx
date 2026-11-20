'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_MVP = {
  name: 'NK.SAAD69',
  team: 'NK',
  kills: 14,
  damage: 5446,
  assist: 6,
  hs: 16,
  knocks: 16,
  onTarget: 33.4,
};

const DEFAULT_COLORS = {
  accentColor: '#FBBF24', // Gold / Amber
  gaugeBg: '#0B0F19',
  cardBg: 'rgba(9, 11, 18, 0.76)',
  borderColor: 'rgba(148, 163, 184, 0.2)',
  fireColor: '#F5B700',
};

export default function Dashboard10({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animated, setAnimated] = useState(false);
  const [displayedAcc, setDisplayedAcc] = useState(0);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard10) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard10 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard10');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  // Read live MVP from sheet if available
  const mvp = React.useMemo(() => {
    if (sheetData?.data && sheetData.data.length > 0) {
      const top = sheetData.data[0];
      const kills = parseInt(top.Kill, 10) || DEFAULT_MVP.kills;
      const damage = parseInt(top.Damage, 10) || DEFAULT_MVP.damage;
      const tag = top.tag || (top.TeamName ? top.TeamName.slice(0, 3).toUpperCase() : DEFAULT_MVP.team);
      return {
        name: top.MvpPlayer || `${tag}.LEADER`,
        team: tag,
        kills,
        damage,
        assist: 6,
        hs: 16,
        knocks: 16,
        onTarget: 33.4,
      };
    }
    return DEFAULT_MVP;
  }, [sheetData]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimated(true);
      // Tween percentage
      const start = performance.now();
      const duration = 1850;
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedAcc(parseFloat((mvp.onTarget * eased).toFixed(1)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 250);
    return () => clearTimeout(t);
  }, [mvp.onTarget]);

  const R = 125;
  const ARC = Math.PI * R;
  const strokeOffset = animated ? ARC * (1 - mvp.onTarget / 100) : ARC;

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Dynamic Background Fire Flame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || colors.accentColor} height={480} opacity={0.65} />
      </div>

      <div className="w-full flex justify-center">
        <div
          className="hud-card rounded-3xl p-6 sm:p-8 flex flex-col items-center w-full max-w-lg backdrop-blur-md shadow-2xl border transition-all"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor,
          }}
        >
          {/* Top Pill */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-4 py-1 rounded-full text-xs font-black text-black tracking-wider shadow-lg flex items-center gap-1.5"
              style={{ background: colors.accentColor }}
            >
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              MATCH MVP • {mvp.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-white border border-white/20">
              {mvp.team}
            </span>
          </div>

          <div className="font-hud text-xs font-bold uppercase tracking-widest text-slate-300 mt-1 mb-5">
            ON-TARGET ACCURACY GAUGE
          </div>

          {/* Semi-Circle Accuracy Arc */}
          <div className="relative w-full max-w-[340px] flex flex-col items-center">
            <svg viewBox="0 0 360 200" className="w-full overflow-visible">
              <defs>
                <linearGradient id="mvp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor={colors.accentColor} />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke={colors.gaugeBg || '#0b0f19'}
                strokeWidth="32"
                strokeLinecap="round"
              />

              {/* Animated Progress Arc */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="url(#mvp-grad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeDasharray={ARC}
                strokeDashoffset={strokeOffset}
                style={{
                  transition: 'stroke-dashoffset 1.85s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>

            {/* Gauge Center Text */}
            <div className="absolute inset-x-0 bottom-3 text-center">
              <div className="font-hud text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(251,191,36,0.4)]">
                {displayedAcc}%
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                SHOTS ON TARGET
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-4 gap-3 w-full mt-7 pt-5 border-t border-slate-800 text-center font-hud">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">KILLS</div>
              <div className="text-lg font-black text-white mt-0.5">{mvp.kills}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">DAMAGE</div>
              <div className="text-lg font-black text-teal-400 mt-0.5">{mvp.damage.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">ASSIST</div>
              <div className="text-lg font-black text-purple-400 mt-0.5">{mvp.assist}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">HEADSHOTS</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">{mvp.hs}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
