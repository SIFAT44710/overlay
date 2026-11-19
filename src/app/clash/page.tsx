'use client';

import React, { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CX = 180;
const CY = 170;
const RADIUS = 125;
const ARC_LEN = Math.PI * RADIUS;

export default function ClashOverlayPage() {
  const [activeTab, setActiveTab] = useState<'overlay7' | 'overlay4' | 'overlay6'>('overlay7');
  const [key, setKey] = useState(0); // Trigger re-animation

  // Fetch real Google Sheet Data
  const { data: pData } = useSWR('/api/sheet7', fetcher, { refreshInterval: 4000 });
  const { data: tData } = useSWR('/api/sheet4', fetcher, { refreshInterval: 4000 });

  // Player 1 & 2 values from Google Sheet
  const player1Name = pData?.player1?.[2] || 'TOP.1SHOVO';
  const player2Name = pData?.player2?.[2] || 'EXE.SEJAN';
  const p1Elims = parseInt(pData?.player1?.[3], 10) || 29;
  const p2Elims = parseInt(pData?.player2?.[3], 10) || 27;
  const p1Dmg = parseInt(pData?.player1?.[4], 10) || 11859;
  const p2Dmg = parseInt(pData?.player2?.[4], 10) || 11890;

  // Percentage calculations
  const elimSum = p1Elims + p2Elims || 1;
  const dmgSum = p1Dmg + p2Dmg || 1;
  const overallP1Pct = Math.round(((p1Elims / elimSum) * 0.5 + (p1Dmg / dmgSum) * 0.5) * 100) || 50;
  const overallP2Pct = 100 - overallP1Pct;

  // Teams values
  const team1Name = tData?.data?.[0]?.[0] || 'RAAD VAI YT';
  const team2Name = tData?.data?.[1]?.[0] || 'NOVA KNIGHT';
  const t1Dmg = parseInt(tData?.data?.[0]?.[8], 10) || 12489;
  const t2Dmg = parseInt(tData?.data?.[1]?.[8], 10) || 13084;
  const teamDmgSum = t1Dmg + t2Dmg || 1;
  const t1Pct = Math.round((t1Dmg / teamDmgSum) * 100) || 50;
  const t2Pct = 100 - t1Pct;

  const replay = () => setKey((k) => k + 1);

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col items-center justify-between p-4 sm:p-6 select-none font-sans">
      {/* Top Floating Control Bar (Hidden in pure OBS browser capture if needed) */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-xs font-black tracking-wider text-teal-300 uppercase">
            DEMO GRAPH • FFWS CLASH GAUGE
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('overlay7'); replay(); }}
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'overlay7'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            1v1 Duel (Slide 7)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('overlay4'); replay(); }}
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'overlay4'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Team Radar Arc (Slide 4)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('overlay6'); replay(); }}
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'overlay6'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            MVP Share (Slide 6)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={replay}
            className="px-3.5 py-1.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/60 text-teal-300 font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <span>⟳</span>
            <span>Replay</span>
          </button>
          <Link
            href="/demo"
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition"
          >
            Showcase
          </Link>
        </div>
      </header>

      {/* Main Broadcast Stage */}
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center my-auto py-8">
        {activeTab === 'overlay7' && (
          <Overlay7View
            key={`o7-${key}`}
            player1={player1Name}
            player2={player2Name}
            pct1={overallP1Pct}
            pct2={overallP2Pct}
            p1Elims={p1Elims}
            p2Elims={p2Elims}
            p1Dmg={p1Dmg}
            p2Dmg={p2Dmg}
          />
        )}

        {activeTab === 'overlay4' && (
          <Overlay4View
            key={`o4-${key}`}
            team1={team1Name}
            team2={team2Name}
            t1Pct={t1Pct}
            t2Pct={t2Pct}
            t1Dmg={t1Dmg}
            t2Dmg={t2Dmg}
          />
        )}

        {activeTab === 'overlay6' && (
          <Overlay6View key={`o6-${key}`} />
        )}
      </div>

      <footer className="text-center text-[11px] font-mono text-white/40 tracking-wider">
        LIVE GOOGLE SHEET SYNC (VMix & UserInput) • vMix BROWSER SOURCE READY (1920x1080)
      </footer>
    </main>
  );
}

// ==========================================
// OVERLAY 7: CLEAN 1v1 DUEL WITH SEMI-CIRCLE
// ==========================================
function Overlay7View({
  player1,
  player2,
  pct1,
  pct2,
  p1Elims,
  p2Elims,
  p1Dmg,
  p2Dmg,
}: {
  player1: string;
  player2: string;
  pct1: number;
  pct2: number;
  p1Elims: number;
  p2Elims: number;
  p1Dmg: number;
  p2Dmg: number;
}) {
  const [animStage, setAnimStage] = useState<'scan' | 'sweep' | 'burst'>('scan');
  const [displayPct1, setDisplayPct1] = useState(0);
  const [displayPct2, setDisplayPct2] = useState(0);

  // Calculate collision coordinate on the semi-circle arc
  const theta = Math.PI * (1 - Math.max(0.05, Math.min(0.95, pct1 / 100)));
  const targetX = CX + RADIUS * Math.cos(theta);
  const targetY = CY - RADIUS * Math.sin(theta);

  useEffect(() => {
    // Stage 1: Laser Scan begins immediately
    const sweepTimer = setTimeout(() => {
      setAnimStage('sweep');
      // Number count up
      let start = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const ease = 1 - Math.pow(1 - t, 3);
        setDisplayPct1(Math.round(pct1 * ease));
        setDisplayPct2(Math.round(pct2 * ease));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);

    const burstTimer = setTimeout(() => {
      setAnimStage('burst');
    }, 2050);

    return () => {
      clearTimeout(sweepTimer);
      clearTimeout(burstTimer);
    };
  }, [pct1, pct2]);

  const rows = [
    { label: 'ELIMS', a: p1Elims, b: p2Elims },
    { label: 'DAMAGE', a: p1Dmg, b: p2Dmg },
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* 3-Col Header: Player 1 — Semi-Circle Clash — Player 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        {/* Player 1 Card */}
        <div className="bg-white border-[3px] border-black rounded-xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] text-center md:text-left transform -skew-x-3">
          <div className="text-xl sm:text-2xl font-black text-black tracking-wider uppercase font-mono">
            {player1}
          </div>
          <div className="text-xs font-black tracking-widest text-violet-700 mt-1 uppercase">
            PLAYER 01 • CHALLENGER
          </div>
        </div>

        {/* Hero Semi-Circle Clash Gauge */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[310px]">
            <svg viewBox="0 0 360 200" className="w-full h-auto overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
              <defs>
                <filter id="glowSparkO7" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer HUD Tick Marks */}
              <g>
                {Array.from({ length: 25 }).map((_, i) => {
                  const angle = Math.PI * (1 - i / 24);
                  const rIn = RADIUS + 18;
                  const rOut = RADIUS + (i % 6 === 0 ? 30 : 24);
                  return (
                    <line
                      key={i}
                      x1={CX + rIn * Math.cos(angle)}
                      y1={CY - rIn * Math.sin(angle)}
                      x2={CX + rOut * Math.cos(angle)}
                      y2={CY - rOut * Math.sin(angle)}
                      stroke={i % 6 === 0 ? '#a78bfa' : 'rgba(255, 255, 255, 0.25)'}
                      strokeWidth={i % 6 === 0 ? '2.5' : '1.5'}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>

              {/* Dark Backing Track */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#0f172a"
                strokeWidth="32"
                strokeLinecap="round"
              />

              {/* Player 1 Arc (Left to Collision) */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="24"
                strokeDasharray={ARC_LEN}
                strokeDashoffset={animStage === 'scan' ? ARC_LEN : ARC_LEN * (1 - pct1 / 100)}
                style={{
                  transition: animStage !== 'scan' ? 'stroke-dashoffset 1.75s cubic-bezier(0.22, 1.12, 0.36, 1)' : 'none',
                }}
              />

              {/* Player 2 Arc (Right to Collision) */}
              <path
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="24"
                strokeDasharray={ARC_LEN}
                strokeDashoffset={animStage === 'scan' ? ARC_LEN : ARC_LEN * (1 - pct2 / 100)}
                style={{
                  transition: animStage !== 'scan' ? 'stroke-dashoffset 1.75s cubic-bezier(0.22, 1.12, 0.36, 1)' : 'none',
                }}
              />

              {/* Laser Needle Scanner */}
              <line
                x1={CX}
                y1={CY}
                x2={CX}
                y2={30}
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                className={animStage === 'scan' ? 'animate-needle-scan' : 'opacity-0'}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              />

              {/* Collision Shockwave Ring */}
              {animStage === 'burst' && (
                <circle
                  cx={targetX}
                  cy={targetY}
                  r="6"
                  fill="none"
                  stroke="#ffffff"
                  className="animate-shockwave-burst"
                />
              )}

              {/* Collision Spark */}
              <circle
                cx={animStage === 'scan' ? 55 : targetX}
                cy={animStage === 'scan' ? 170 : targetY}
                r="7"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
                filter="url(#glowSparkO7)"
                style={{
                  transition: animStage !== 'scan' ? 'cx 1.75s cubic-bezier(0.22, 1.12, 0.36, 1), cy 1.75s cubic-bezier(0.22, 1.12, 0.36, 1)' : 'none',
                }}
              />
            </svg>

            {/* Center Score Pill */}
            <div className="absolute inset-x-0 bottom-1 flex flex-col items-center pointer-events-none">
              <div className="px-4 py-1.5 rounded-lg bg-black border-2 border-white/20 font-mono text-xl font-black text-white shadow-2xl flex items-center gap-2">
                <span className="text-violet-300">{displayPct1}%</span>
                <span className="text-slate-500 text-xs">VS</span>
                <span className="text-teal-300">{displayPct2}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="bg-violet-700 border-[3px] border-black rounded-xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] text-center md:text-right transform skew-x-3">
          <div className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase font-mono">
            {player2}
          </div>
          <div className="text-xs font-black tracking-widest text-teal-300 mt-1 uppercase">
            PLAYER 02 • CONTENDER
          </div>
        </div>
      </div>

      {/* Skewed Split Comparison Bars */}
      <div className="space-y-4 max-w-2xl mx-auto pt-2">
        {rows.map((r, idx) => {
          const sum = r.a + r.b || 1;
          const pA = Math.round((r.a / sum) * 100);
          const pB = 100 - pA;
          return (
            <div
              key={idx}
              className="transform -skew-x-12 bg-black border-[3px] border-black rounded-lg overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,0.6)]"
            >
              <div className="relative flex items-center h-10 w-full">
                {/* Left Bar (Player 1) */}
                <div
                  className="h-full bg-slate-900 flex items-center pl-4 transition-all duration-1000 ease-out"
                  style={{ width: `${animStage === 'scan' ? 50 : pA}%` }}
                >
                  <span className="transform skew-x-12 font-mono font-black text-sm text-white">
                    {r.a.toLocaleString()}
                  </span>
                </div>
                {/* Right Bar (Player 2) */}
                <div
                  className="h-full bg-violet-600 flex items-center justify-end pr-4 transition-all duration-1000 ease-out"
                  style={{ width: `${animStage === 'scan' ? 50 : pB}%` }}
                >
                  <span className="transform skew-x-12 font-mono font-black text-sm text-white">
                    {r.b.toLocaleString()}
                  </span>
                </div>
                {/* Center Badge Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="transform skew-x-12 px-3 py-0.5 rounded bg-black text-[10px] font-black tracking-widest text-teal-300 border border-white/20 uppercase shadow">
                    {r.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// OVERLAY 4: TEAM RADAR + ADVANTAGE ARC
// ==========================================
function Overlay4View({
  team1,
  team2,
  t1Pct,
  t2Pct,
  t1Dmg,
  t2Dmg,
}: {
  team1: string;
  team2: string;
  t1Pct: number;
  t2Pct: number;
  t1Dmg: number;
  t2Dmg: number;
}) {
  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Top Banner Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="transform -skew-x-12 bg-black border-[3px] border-black px-6 py-3.5 rounded-lg shadow-[5px_5px_0px_rgba(0,0,0,0.7)]">
          <div className="transform skew-x-12 flex items-center justify-between">
            <span className="font-mono text-xl font-black italic text-white uppercase">{team1}</span>
            <span className="font-mono text-sm font-black text-violet-300">{t1Dmg.toLocaleString()} DMG</span>
          </div>
        </div>
        <div className="transform -skew-x-12 bg-violet-700 border-[3px] border-black px-6 py-3.5 rounded-lg shadow-[5px_5px_0px_rgba(0,0,0,0.7)]">
          <div className="transform skew-x-12 flex items-center justify-between">
            <span className="font-mono text-sm font-black text-teal-200">{t2Dmg.toLocaleString()} DMG</span>
            <span className="font-mono text-xl font-black italic text-white uppercase">{team2}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Diamond Radar on Left, Semi-Circle Gauge on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        {/* 4-Axis Diamond Radar */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-mono font-black text-violet-300 uppercase tracking-widest mb-2">
            4-AXIS COMBAT MATRIX
          </div>
          <svg viewBox="0 0 280 230" className="w-full max-w-[270px] h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <polygon points="140,30 230,115 140,200 50,115" fill="rgba(15,23,42,0.85)" stroke="#000000" strokeWidth="2" />
            <polygon points="140,58 200,115 140,172 80,115" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <polygon points="140,86 170,115 140,144 110,115" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            
            {/* Team 1 Polygon */}
            <polygon
              points="140,52 216,115 140,176 68,115"
              fill="rgba(124, 58, 237, 0.45)"
              stroke="#a78bfa"
              strokeWidth="2.5"
            />
            {/* Team 2 Polygon */}
            <polygon
              points="140,65 184,115 140,162 82,115"
              fill="rgba(45, 212, 191, 0.35)"
              stroke="#2dd4bf"
              strokeWidth="2.5"
            />

            {/* Labels */}
            <rect x="108" y="4" width="64" height="18" rx="4" fill="#000" />
            <text x="140" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" fontFamily="monospace">KILL PTS</text>
            <rect x="234" y="106" width="42" height="18" rx="4" fill="#000" />
            <text x="255" y="118" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" fontFamily="monospace">DAMAGE</text>
            <rect x="110" y="206" width="60" height="18" rx="4" fill="#000" />
            <text x="140" y="218" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" fontFamily="monospace">ASSIST</text>
            <rect x="2" y="106" width="46" height="18" rx="4" fill="#000" />
            <text x="25" y="118" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" fontFamily="monospace">KNOCK</text>
          </svg>
        </div>

        {/* Semi-Circle Damage Share Gauge */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-mono font-black text-teal-300 uppercase tracking-widest mb-2">
            HEAD-TO-HEAD DAMAGE SHARE
          </div>
          <div className="relative w-full max-w-[270px]">
            <svg viewBox="0 0 360 200" className="w-full h-auto overflow-visible drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              {/* Backing Track */}
              <path d="M 55 170 A 125 125 0 0 1 305 170" fill="none" stroke="#0f172a" strokeWidth="32" strokeLinecap="round" />
              {/* Team 1 Arc */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="24"
                strokeDasharray={ARC_LEN}
                strokeDashoffset={ARC_LEN * (1 - t1Pct / 100)}
                className="transition-all duration-1000 ease-out"
              />
              {/* Team 2 Arc */}
              <path
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="24"
                strokeDasharray={ARC_LEN}
                strokeDashoffset={ARC_LEN * (1 - t2Pct / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-2 flex justify-center">
              <div className="px-3.5 py-1 rounded bg-black/90 border border-white/20 font-mono font-black text-sm text-white">
                <span className="text-violet-300">{t1Pct}%</span> <span className="text-slate-500">VS</span> <span className="text-teal-300">{t2Pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// OVERLAY 6: MVP DAMAGE SHARE ARC
// ==========================================
function Overlay6View() {
  const mvpPct = 38;
  return (
    <div className="w-full max-w-lg mx-auto bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase font-mono">
            MATCH MVP
          </span>
          <h2 className="text-2xl font-black text-white font-mono mt-1">NK.SAAD69</h2>
        </div>
        <div className="text-right font-mono">
          <div className="text-xl font-black text-amber-400">14 KILLS</div>
          <div className="text-xs text-slate-400">5,446 DAMAGE</div>
        </div>
      </div>

      <div className="relative w-full max-w-[290px] mx-auto">
        <svg viewBox="0 0 360 200" className="w-full h-auto overflow-visible drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <path d="M 55 170 A 125 125 0 0 1 305 170" fill="none" stroke="#0f172a" strokeWidth="32" strokeLinecap="round" />
          <path
            d="M 55 170 A 125 125 0 0 1 305 170"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="24"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN * (1 - mvpPct / 100)}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <span className="text-3xl font-black font-mono text-amber-400">{mvpPct}%</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            SQUAD DAMAGE CONTRIBUTION
          </span>
        </div>
      </div>
    </div>
  );
}
