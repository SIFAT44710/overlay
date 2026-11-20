'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PlayerStats {
  name: string;
  team: string;
  kills: number;
  damage: number;
  hs: number;
  assist: number;
}

const DEFAULT_DUEL: { p1: PlayerStats; p2: PlayerStats } = {
  p1: { name: 'TOP.1SHOVO', team: 'RAAD VAI YT', kills: 29, damage: 11859, hs: 31, assist: 22 },
  p2: { name: 'EXE.SEJAN',  team: 'EXTREME EX',  kills: 27, damage: 11890, hs: 22, assist: 13 },
};

export default function Dashboard3({ overrideColors }: { overrideColors?: any } = {}) {
  const [animStep, setAnimStep] = useState(0);
  const [labelVisible, setLabelVisible] = useState<boolean[]>([false, false, false, false]);
  const [barsExpanded, setBarsExpanded] = useState(false);
  const [fireActive, setFireActive] = useState(false);
  const [dispP1, setDispP1] = useState(0);
  const [dispP2, setDispP2] = useState(0);
  const [dispValuesA, setDispValuesA] = useState<number[]>([0, 0, 0, 0]);
  const [dispValuesB, setDispValuesB] = useState<number[]>([0, 0, 0, 0]);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const duel = sheetData?.duel1v1 || DEFAULT_DUEL;
  const p1 = duel.p1 || DEFAULT_DUEL.p1;
  const p2 = duel.p2 || DEFAULT_DUEL.p2;

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
    { label: 'ELIMINATIONS', a: p1.kills, b: p2.kills },
    { label: 'TOTAL DAMAGE', a: p1.damage, b: p2.damage },
    { label: 'HEADSHOTS', a: p1.hs, b: p2.hs },
    { label: 'ASSISTS', a: p1.assist, b: p2.assist },
  ];

  const winnerSide = s1 >= s2 ? 'p1' : 'p2';

  useEffect(() => {
    // 1. Gauge Arcs expand & percentages tween at 420ms
    const tArc = setTimeout(() => {
      setAnimStep(1);
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

    // 3. Step 1: Center labels appear one by one (350 + idx * 340ms)
    const labelTimers = rows.map((_, idx) =>
      setTimeout(() => {
        setLabelVisible((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, 350 + idx * 340)
    );

    // 4. Step 2: At 1850ms, both bars sweep outward and numbers tween
    const tBars = setTimeout(() => {
      setBarsExpanded(true);
      const start = performance.now();
      const dur = 1650;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setDispValuesA(rows.map((r) => Math.round(r.a * eased)));
        setDispValuesB(rows.map((r) => Math.round(r.b * eased)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1850);

    // 5. Step 3: At 2050ms, ignite real-time Free Fire spirit-flame on winner card
    const tFire = setTimeout(() => {
      setFireActive(true);
    }, 2050);

    return () => {
      clearTimeout(tArc);
      clearTimeout(tShock);
      clearTimeout(tBars);
      clearTimeout(tFire);
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
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-5">
        {/* Top 3-Column Header: Contender 1, Clash Gauge, Contender 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Contender 01 Card */}
          <div
            className={`hud-card rounded-2xl p-4 border-l-4 border-l-violet-500 text-center md:text-left relative transition-all duration-700 ${
              winnerSide === 'p1' && fireActive ? 'fire-winner-card top1-scale' : ''
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winnerSide === 'p1' && (
              <div
                className={`pointer-events-none absolute -inset-x-3 -top-12 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <div className="relative z-10 flex items-center justify-center md:justify-between gap-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                CONTENDER 01
              </div>
              {winnerSide === 'p1' && (
                <span
                  className={`transition-all duration-500 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400 text-white font-hud text-[9.5px] font-extrabold tracking-wider shadow-lg ${
                    fireActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  TOP LEADER
                </span>
              )}
            </div>
            <div className="relative z-10 font-hud text-2xl font-bold text-white mt-0.5">
              {p1.name}
            </div>
            <div className="relative z-10 text-xs font-semibold text-slate-300">{p1.team}</div>
          </div>

          {/* Semi-Circle Clash Gauge */}
          <div className="relative flex flex-col items-center">
            <svg
              viewBox="0 0 360 195"
              className="w-full max-w-[300px] overflow-visible drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]"
            >
              {ticks}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(168,85,247,0.16)"
                strokeWidth="32"
              />
              <path
                className="arc-sweep"
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={animStep >= 1 ? ARC * (1 - pct1 / 100) : ARC}
              />
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#c084fc"
                strokeOpacity="0.85"
                strokeWidth="5"
                className="energy-line"
              />
              <path
                className="arc-sweep"
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={animStep >= 1 ? ARC * (1 - pct2 / 100) : ARC}
              />
              <line
                x1="180"
                y1="170"
                x2="180"
                y2="26"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0}
                className="scanner-run"
              />
              <circle
                cx={px.toFixed(1)}
                cy={py.toFixed(1)}
                r="6"
                fill="none"
                stroke="#fff"
                opacity="0"
                className={animStep >= 2 ? 'shock-run' : ''}
              />
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
            <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
              <div className="px-4 py-1 rounded-lg bg-transparent border border-purple-400/35 font-hud text-xl font-bold text-white shadow-xl">
                <span className="text-violet-400">{dispP1}%</span>
                <span className="text-amber-400 text-xs mx-1.5">VS</span>
                <span className="text-teal-300">{dispP2}%</span>
              </div>
            </div>
          </div>

          {/* Contender 02 Card */}
          <div
            className={`hud-card rounded-2xl p-4 border-r-4 border-r-teal-400 text-center md:text-right relative transition-all duration-700 ${
              winnerSide === 'p2' && fireActive ? 'fire-winner-card top1-scale' : ''
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winnerSide === 'p2' && (
              <div
                className={`pointer-events-none absolute -inset-x-3 -top-12 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <div className="relative z-10 flex items-center justify-center md:justify-between gap-2">
              {winnerSide === 'p2' ? (
                <span
                  className={`transition-all duration-500 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400 text-white font-hud text-[9.5px] font-extrabold tracking-wider shadow-lg ${
                    fireActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  TOP LEADER
                </span>
              ) : (
                <span />
              )}
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                CONTENDER 02
              </div>
            </div>
            <div className="relative z-10 font-hud text-2xl font-bold text-white mt-0.5">
              {p2.name}
            </div>
            <div className="relative z-10 text-xs font-semibold text-slate-300">{p2.team}</div>
          </div>
        </div>

        {/* 4 Center-Outward Skewed Duel Bars */}
        <div className="space-y-2.5 max-w-2xl mx-auto">
          {rows.map((r, idx) => {
            const rowMax = Math.max(r.a, r.b) * 1.06;
            const wA = Math.max(24, Math.round((r.a / rowMax) * 100));
            const wB = Math.max(24, Math.round((r.b / rowMax) * 100));
            const leftWins = r.a > r.b;
            const rightWins = r.b > r.a;

            return (
              <div
                key={r.label}
                className="skew-box bg-transparent border-0 rounded-lg overflow-visible"
              >
                <div className="relative flex items-center h-10 w-full">
                  {/* Left Half: Outward expansion */}
                  <div className="w-1/2 h-full flex justify-end overflow-hidden">
                    <div
                      className={`bar-live h-full rounded-l-md bg-gradient-to-l from-violet-600 via-purple-700 to-fuchsia-700 flex items-center justify-start pl-4 overflow-hidden ${
                        fireActive && leftWins ? 'fire-bar-glow' : ''
                      }`}
                      style={{
                        ['--bar-glow' as any]: '#e879f9',
                        width: barsExpanded ? `${wA}%` : '0%',
                        boxShadow: '0 0 12px rgba(168,85,247,0.55)',
                        transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <span
                        className={`unskew font-hud font-bold text-sm text-white transition-opacity duration-500 ${
                          barsExpanded ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {dispValuesA[idx].toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Half: Outward expansion */}
                  <div className="w-1/2 h-full flex justify-start overflow-hidden">
                    <div
                      className={`bar-live h-full rounded-r-md bg-gradient-to-r from-cyan-500 to-teal-600 flex items-center justify-end pr-4 overflow-hidden ${
                        fireActive && rightWins ? 'fire-bar-glow' : ''
                      }`}
                      style={{
                        ['--bar-glow' as any]: '#5eead4',
                        width: barsExpanded ? `${wB}%` : '0%',
                        boxShadow: '0 0 12px rgba(45,212,191,0.55)',
                        transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <span
                        className={`unskew font-hud font-bold text-sm text-slate-950 font-extrabold transition-opacity duration-500 ${
                          barsExpanded ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {dispValuesB[idx].toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Center Stat Label Pill: Appears FIRST slowly one by one */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="unskew px-3.5 py-0.5 rounded bg-purple-950/80 text-[10.5px] font-bold tracking-widest text-purple-100 border border-purple-400/60 shadow"
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
