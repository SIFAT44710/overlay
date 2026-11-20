'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PlayerStats {
  name: string;
  team: string;
  kills: number;
  damage: number;
  hs: number;
  assist: number;
}

const DEFAULT_DUEL = {
  p1: { name: 'TOP.1SHOVO', team: 'RAAD VAI YT', kills: 29, damage: 11859, hs: 31, assist: 22 },
  p2: { name: 'EXE.SEJAN',  team: 'EXTREME EX',  kills: 27, damage: 11890, hs: 22, assist: 13 },
};

export default function Dashboard3({ overrideColors }: { overrideColors?: any } = {}) {
  const [animStep, setAnimStep] = useState(0);
  const [labelVisible, setLabelVisible] = useState<boolean[]>([false, false, false, false]);
  const [barsExpanded, setBarsExpanded] = useState(false);
  const [dispP1, setDispP1] = useState(0);
  const [dispP2, setDispP2] = useState(0);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const duel = DEFAULT_DUEL;
  const p1 = duel.p1;
  const p2 = duel.p2;

  const s1 = p1.kills * 100 + p1.damage * 0.1 + p1.hs * 40;
  const s2 = p2.kills * 100 + p2.damage * 0.1 + p2.hs * 40;
  const pct1 = Math.round((s1 / (s1 + s2)) * 100);
  const pct2 = 100 - pct1;

  const R = 125;
  const CX = 180;
  const CY = 170;
  const ARC = Math.PI * R;
  const theta = Math.PI * (1 - pct1 / 100);
  const px = CX + R * Math.cos(theta);
  const py = CY - R * Math.sin(theta);

  const rows = [
    { label: 'ELIMINATIONS', a: p1.kills, b: p2.kills, max: Math.max(p1.kills, p2.kills) * 1.25 },
    { label: 'TOTAL DAMAGE', a: p1.damage, b: p2.damage, max: Math.max(p1.damage, p2.damage) * 1.2 },
    { label: 'HEADSHOTS', a: p1.hs, b: p2.hs, max: Math.max(p1.hs, p2.hs) * 1.3 },
    { label: 'ASSISTS', a: p1.assist, b: p2.assist, max: Math.max(p1.assist, p2.assist) * 1.3 },
  ];

  useEffect(() => {
    // 1. Gauge Arcs expand at 420ms
    const tArc = setTimeout(() => {
      setAnimStep(1);
      // Tween percentage
      const start = performance.now();
      const dur = 1800;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setDispP1(Math.round(pct1 * eased));
        setDispP2(Math.round(pct2 * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 420);

    // 2. Shockwave burst at 2150ms
    const tShock = setTimeout(() => setAnimStep(2), 2150);

    // 3. Center labels appear one by one
    const labelTimers = rows.map((_, idx) =>
      setTimeout(() => {
        setLabelVisible((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, 350 + idx * 340)
    );

    // 4. Bars sweep outward simultaneously after all 4 labels appear (1750ms)
    const tBars = setTimeout(() => {
      setBarsExpanded(true);
    }, 1750);

    return () => {
      clearTimeout(tArc);
      clearTimeout(tShock);
      clearTimeout(tBars);
      labelTimers.forEach(clearTimeout);
    };
  }, [pct1, pct2]);

  // Build 25 ticks
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= 24; i++) {
    const th = Math.PI * (1 - i / 24);
    const x1 = (CX + (R + 20) * Math.cos(th)).toFixed(1);
    const y1 = (CY - (R + 20) * Math.sin(th)).toFixed(1);
    const x2 = (CX + (R + (i % 6 === 0 ? 30 : 25)) * Math.cos(th)).toFixed(1);
    const y2 = (CY - (R + (i % 6 === 0 ? 30 : 25)) * Math.sin(th)).toFixed(1);
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i % 6 === 0 ? '#fbbf24' : 'rgba(148,163,184,0.45)'}
        strokeWidth={i % 6 === 0 ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-5">
        {/* Top 3-Column Header: Contender 1, Clash Gauge, Contender 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Contender 01 Card */}
          <div className="hud-card rounded-2xl p-4 border-l-4 border-l-violet-500 text-center md:text-left relative overflow-hidden gloss-bar shadow-xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              CONTENDER 01
            </div>
            <div className="font-hud text-2xl font-bold text-white mt-0.5">{p1.name}</div>
            <div className="text-xs font-semibold text-slate-400">{p1.team}</div>
          </div>

          {/* Clash Semi-Circle SVG Gauge */}
          <div className="relative flex flex-col items-center">
            <svg
              viewBox="0 0 360 195"
              className="w-full max-w-[300px] overflow-visible drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]"
            >
              {ticks}
              {/* Gauge Background Track */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#0b0f19"
                strokeWidth="32"
              />

              {/* Contender 1 Arc (Violet) */}
              <path
                className="arc-sweep"
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={animStep >= 1 ? ARC * (1 - pct1 / 100) : ARC}
              />

              {/* Energy Line */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="5"
                className="energy-line"
              />

              {/* Contender 2 Arc (Teal) */}
              <path
                className="arc-sweep"
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={animStep >= 1 ? ARC * (1 - pct2 / 100) : ARC}
              />

              {/* Scanner Needle */}
              <line
                x1="180"
                y1="170"
                x2="180"
                y2="26"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0"
                className="scanner-run"
              />

              {/* Shockwave Burst Circle */}
              <circle
                cx={px.toFixed(1)}
                cy={py.toFixed(1)}
                r="6"
                fill="none"
                stroke="#fff"
                opacity="0"
                className={animStep >= 2 ? 'shock-run' : ''}
              />

              {/* Moving Spark Node */}
              <circle
                cx={animStep >= 1 ? px.toFixed(1) : '55'}
                cy={animStep >= 1 ? py.toFixed(1) : '170'}
                r="7.5"
                fill="#fff"
                stroke="#090b10"
                strokeWidth="2"
                style={{
                  transition:
                    'cx 1.85s cubic-bezier(0.22, 1.08, 0.36, 1), cy 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
                }}
              />
            </svg>

            {/* Bottom Ratio Box */}
            <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
              <div className="px-4 py-1 rounded-lg bg-slate-950/95 border border-white/15 font-hud text-xl font-bold text-white shadow-xl">
                <span className="text-violet-400">{dispP1}%</span>
                <span className="text-amber-400 text-xs mx-1.5">VS</span>
                <span className="text-teal-300">{dispP2}%</span>
              </div>
            </div>
          </div>

          {/* Contender 02 Card */}
          <div className="hud-card rounded-2xl p-4 border-r-4 border-r-teal-400 text-center md:text-right relative overflow-hidden gloss-bar shadow-xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
              CONTENDER 02
            </div>
            <div className="font-hud text-2xl font-bold text-white mt-0.5">{p2.name}</div>
            <div className="text-xs font-semibold text-slate-400">{p2.team}</div>
          </div>
        </div>

        {/* 4 Center-Outward Skewed Duel Bars */}
        <div className="space-y-2.5 max-w-2xl mx-auto">
          {rows.map((r, idx) => {
            const widthA = Math.min(100, Math.round((r.a / r.max) * 100));
            const widthB = Math.min(100, Math.round((r.b / r.max) * 100));

            return (
              <div
                key={r.label}
                className="skew-box bg-slate-950/95 border border-white/15 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative flex items-center h-10 w-full">
                  {/* Left Half: Expands OUTWARD from center toward left */}
                  <div className="w-1/2 h-full flex justify-end overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-violet-500 to-violet-700 flex items-center justify-start pl-4 overflow-hidden"
                      style={{
                        width: barsExpanded ? `${widthA}%` : '0%',
                        transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <span
                        className="unskew font-hud font-bold text-sm text-white"
                        style={{
                          opacity: barsExpanded ? 1 : 0,
                          transition: 'opacity 0.5s ease 0.4s',
                        }}
                      >
                        {r.a.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Half: Expands OUTWARD from center toward right */}
                  <div className="w-1/2 h-full flex justify-start overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-end pr-4 overflow-hidden"
                      style={{
                        width: barsExpanded ? `${widthB}%` : '0%',
                        transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <span
                        className="unskew font-hud font-bold text-sm text-slate-950 font-extrabold"
                        style={{
                          opacity: barsExpanded ? 1 : 0,
                          transition: 'opacity 0.5s ease 0.4s',
                        }}
                      >
                        {r.b.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Center Stat Label Pill: Appears FIRST slowly one by one */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="unskew px-3 py-0.5 rounded bg-slate-950 text-[10.5px] font-bold tracking-widest text-amber-300 border border-amber-400/40 shadow"
                      style={{
                        opacity: labelVisible[idx] ? 1 : 0,
                        transform: labelVisible[idx]
                          ? 'skewX(10deg) translateY(0) scale(1)'
                          : 'skewX(10deg) translateY(8px) scale(0.9)',
                        transition:
                          'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22, 1.15, 0.36, 1)',
                      }}
                    >
                      {r.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
