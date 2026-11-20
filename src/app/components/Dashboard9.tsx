'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_DATA = {
  a: { name: '69', tag: '69', avgElims: 9.6, avgDmg: 5407, avgSurvMin: 8.5 },
  b: { name: 'CME', tag: 'CME', avgElims: 11.6, avgDmg: 8805, avgSurvMin: 14.5 },
};

const DEFAULT_COLORS = {
  team1: '#8B5CF6', // Violet
  team2: '#2DD4BF', // Teal
  cardBg: 'rgba(9, 11, 18, 0.72)',
  borderColor: 'rgba(148, 163, 184, 0.16)',
  fireColor: '#8B5CF6',
};

export default function Dashboard9({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animated, setAnimated] = useState(false);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard9) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard9 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard9');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Compute live averages if sheetData has match data
  const stats = React.useMemo(() => {
    const data = { ...DEFAULT_DATA };
    const teams = sheetData?.data || dayData?.standing || [];
    if (teams.length >= 2) {
      const t1 = teams[0];
      const t2 = teams[1];
      const t1Tag = t1.tag || (t1.TeamName ? t1.TeamName.slice(0, 3).toUpperCase() : 'TOP');
      const t2Tag = t2.tag || (t2.TeamName ? t2.TeamName.slice(0, 3).toUpperCase() : 'EXE');
      const t1K = parseFloat(t1.Kill || t1.elims || 12);
      const t2K = parseFloat(t2.Kill || t2.elims || 10);
      const t1D = parseFloat(t1.Damage || 6500);
      const t2D = parseFloat(t2.Damage || 5800);

      data.a = {
        name: t1Tag,
        tag: t1Tag,
        avgElims: parseFloat((t1K / 1.2).toFixed(1)),
        avgDmg: Math.round(t1D),
        avgSurvMin: 14.5,
      };
      data.b = {
        name: t2Tag,
        tag: t2Tag,
        avgElims: parseFloat((t2K / 1.2).toFixed(1)),
        avgDmg: Math.round(t2D),
        avgSurvMin: 12.8,
      };
    }
    return data;
  }, [sheetData, dayData]);

  const R_OUTER = 52;
  const CIRC_OUTER = 2 * Math.PI * R_OUTER;
  const R_INNER = 36;
  const CIRC_INNER = 2 * Math.PI * R_INNER;

  const cards = [
    {
      title: 'AVG ELIMS / MATCH',
      va: stats.a.avgElims,
      vb: stats.b.avgElims,
      max: 15,
      dec: 1,
      suf: '',
    },
    {
      title: 'AVG DAMAGE / MATCH',
      va: stats.a.avgDmg,
      vb: stats.b.avgDmg,
      max: 10000,
      dec: 0,
      suf: '',
    },
    {
      title: 'AVG SURVIVAL (MIN)',
      va: stats.a.avgSurvMin,
      vb: stats.b.avgSurvMin,
      max: 18,
      dec: 1,
      suf: 'm',
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Dynamic Background Fire Animation */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || colors.team1} height={480} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Header Tag / Team Badges */}
        <div className="flex justify-center items-center gap-6 text-sm font-hud">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-extrabold shadow-lg border border-black/40"
            style={{ backgroundColor: colors.team1 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>{stats.a.tag}</span>
          </div>

          <span className="font-hud text-xs font-black text-slate-400 tracking-widest uppercase">VS</span>

          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-slate-950 font-extrabold shadow-lg border border-black/40"
            style={{ backgroundColor: colors.team2 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
            <span>{stats.b.tag}</span>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c, i) => {
            const pctA = Math.min(1, c.va / c.max);
            const pctB = Math.min(1, c.vb / c.max);
            const offsetA = animated ? CIRC_OUTER * (1 - pctA) : CIRC_OUTER;
            const offsetB = animated ? CIRC_INNER * (1 - pctB) : CIRC_INNER;

            return (
              <div
                key={i}
                className="hud-card rounded-2xl p-6 flex flex-col items-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: colors.cardBg || 'rgba(9, 11, 18, 0.75)',
                  borderColor: colors.borderColor || 'rgba(148, 163, 184, 0.2)',
                }}
              >
                <div className="font-hud text-xs font-bold text-slate-300 tracking-wider mb-4 uppercase text-center">
                  {c.title}
                </div>

                {/* Dual Concentric SVG Gauge */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                    {/* Background Tracks */}
                    <circle
                      cx="70"
                      cy="70"
                      r={R_OUTER}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={R_INNER}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />

                    {/* Team A Outer Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r={R_OUTER}
                      fill="none"
                      stroke={colors.team1}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={CIRC_OUTER}
                      strokeDashoffset={offsetA}
                      style={{
                        transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    {/* Team B Inner Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r={R_INNER}
                      fill="none"
                      stroke={colors.team2}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={CIRC_INNER}
                      strokeDashoffset={offsetB}
                      style={{
                        transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                      }}
                    />
                  </svg>
                </div>

                {/* Score Comparison Footer */}
                <div className="w-full flex justify-between items-center mt-4 pt-3 border-t border-slate-800 font-hud text-base font-extrabold px-2">
                  <span style={{ color: colors.team1 }}>
                    {c.dec > 0 ? c.va.toFixed(c.dec) : c.va.toLocaleString()}
                    {c.suf}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans tracking-widest uppercase">
                    RATIO
                  </span>
                  <span style={{ color: colors.team2 }}>
                    {c.dec > 0 ? c.vb.toFixed(c.dec) : c.vb.toLocaleString()}
                    {c.suf}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
