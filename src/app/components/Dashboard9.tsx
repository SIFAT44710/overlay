'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GroupAvgTeam {
  name: string;
  tag: string;
  avgElims: number;
  avgDmg: number;
  avgSurvMin: number;
}

const DEFAULT_DATA: { a: GroupAvgTeam; b: GroupAvgTeam } = {
  a: { name: '69 ESPORTS',        tag: '69',  avgElims: 9.6,  avgDmg: 5407, avgSurvMin: 8.5 },
  b: { name: 'COFFIN MAKERS ESP', tag: 'CME', avgElims: 11.6, avgDmg: 8805, avgSurvMin: 14.5 },
};

export default function Dashboard9({ overrideColors }: { overrideColors?: any } = {}) {
  const [activeCards, setActiveCards] = useState<boolean[]>([false, false, false]);
  const [dispValuesA, setDispValuesA] = useState<number[]>([0, 0, 0]);
  const [dispValuesB, setDispValuesB] = useState<number[]>([0, 0, 0]);
  const [fireActive, setFireActive] = useState(false);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

  const stats = React.useMemo(() => {
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

      return {
        a: {
          name: t1Tag,
          tag: t1Tag,
          avgElims: parseFloat((t1K / 1.2).toFixed(1)),
          avgDmg: Math.round(t1D),
          avgSurvMin: 14.5,
        },
        b: {
          name: t2Tag,
          tag: t2Tag,
          avgElims: parseFloat((t2K / 1.2).toFixed(1)),
          avgDmg: Math.round(t2D),
          avgSurvMin: 12.8,
        },
      };
    }
    return DEFAULT_DATA;
  }, [sheetData, dayData]);

  const { a, b } = stats;
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const R_INNER = 36;
  const CIRC_INNER = 2 * Math.PI * R_INNER;
  const winTeamSide = b.avgDmg >= a.avgDmg ? 'b' : 'a';

  const cards = [
    { title: 'AVG ELIMS / MATCH',  va: a.avgElims,   vb: b.avgElims,   max: 15,    dec: 1, suf: '' },
    { title: 'AVG DAMAGE / MATCH', va: a.avgDmg,     vb: b.avgDmg,     max: 10000, dec: 0, suf: '' },
    { title: 'AVG SURVIVAL (MIN)', va: a.avgSurvMin, vb: b.avgSurvMin, max: 18,    dec: 1, suf: 'm' },
  ];

  useEffect(() => {
    cards.forEach((c, i) => {
      setTimeout(() => {
        setActiveCards((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        // Tween values
        const start = performance.now();
        const dur = 1600;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setDispValuesA((prev) => {
            const next = [...prev];
            next[i] = c.dec === 1 ? parseFloat((c.va * eased).toFixed(1)) : Math.round(c.va * eased);
            return next;
          });
          setDispValuesB((prev) => {
            const next = [...prev];
            next[i] = c.dec === 1 ? parseFloat((c.vb * eased).toFixed(1)) : Math.round(c.vb * eased);
            return next;
          });
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 200 + i * 220);
    });

    const tFire = setTimeout(() => {
      setFireActive(true);
    }, 380);

    return () => clearTimeout(tFire);
  }, [a.avgDmg, b.avgDmg]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-4">
        {/* Top Team Badges */}
        <div className="flex justify-center gap-6 text-xs font-bold font-hud">
          {/* Team A Badge */}
          <span
            className={`px-3.5 py-1.5 rounded-full bg-violet-600 text-white relative transition-all duration-500 ${
              winTeamSide === 'a' && fireActive ? 'top1-hero-glow scale-105' : ''
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winTeamSide === 'a' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10">● {a.name}</span>
          </span>

          {/* Team B Badge */}
          <span
            className={`px-3.5 py-1.5 rounded-full bg-teal-400 text-slate-950 relative transition-all duration-500 ${
              winTeamSide === 'b' && fireActive ? 'top1-hero-glow scale-105' : ''
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winTeamSide === 'b' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10">● {b.name}</span>
          </span>
        </div>

        {/* 3 Donut Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c, i) => {
            const isLoaded = activeCards[i];
            const isDmgCard = i === 1;
            const targetA = CIRC * (1 - c.va / c.max);
            const targetB = CIRC_INNER * (1 - c.vb / c.max);

            return (
              <div
                key={c.title}
                className={`hud-card rounded-2xl p-5 flex flex-col items-center relative transition-all duration-500 ${
                  isDmgCard && fireActive ? 'top1-hero-glow scale-105' : ''
                }`}
                style={{ isolation: 'isolate' }}
              >
                {/* Real-time Spirit Fire Canvas on Center Damage Card */}
                {isDmgCard && (
                  <div
                    className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500 ${
                      fireActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ zIndex: -1 }}
                  >
                    <RealFireCanvas opts={{ light: true }} />
                  </div>
                )}

                <div className="relative z-10 font-hud text-xs font-bold text-slate-300 tracking-wider mb-3">
                  {c.title}
                </div>

                {/* Concentric Double Donut SVG */}
                <svg viewBox="0 0 140 140" className="w-36 h-36">
                  {/* Outer ring track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                  />
                  {/* Outer progress ring (Team A Violet) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    className="arc-sweep neon-pulse"
                    style={{ color: '#8b5cf6' }}
                    strokeDasharray={CIRC}
                    strokeDashoffset={isLoaded ? targetA : CIRC}
                  />

                  {/* Inner ring track */}
                  <circle
                    cx="70"
                    cy="70"
                    r={R_INNER}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                  />
                  {/* Inner progress ring (Team B Teal) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={R_INNER}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="10"
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    className="arc-sweep neon-pulse"
                    style={{ color: '#2dd4bf', animationDelay: '0.5s' }}
                    strokeDasharray={CIRC_INNER}
                    strokeDashoffset={isLoaded ? targetB : CIRC_INNER}
                  />
                </svg>

                {/* Bottom Values */}
                <div className="relative z-10 w-full flex justify-between mt-3 pt-2 border-t border-slate-800 font-hud text-sm font-bold">
                  <span className="text-violet-400">
                    {dispValuesA[i]}
                    {c.suf}
                  </span>
                  <span className="text-teal-300">
                    {dispValuesB[i]}
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
