'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide05GroupAverages({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const [displayVals, setDisplayVals] = useState([
    { a: 0, b: 0 },
    { a: 0, b: 0 },
    { a: 0, b: 0 },
  ]);

  const themeS4 = theme?.s4 || { teamA: '#8b5cf6', teamB: '#2dd4bf' };
  const custom = theme?.custom;
  const source = theme?.sources?.[4] || 'group_avg_h2h';

  let a = sheetData?.h2hGroupAvg?.a || {
    name: '69 ESPORTS',
    tag: '69',
    avgElims: 9.6,
    avgDmg: 5407,
    avgSurvMin: 8.5,
  };
  let b = sheetData?.h2hGroupAvg?.b || {
    name: 'COFFIN MAKERS ESP',
    tag: 'CME',
    avgElims: 11.6,
    avgDmg: 8805,
    avgSurvMin: 14.5,
  };

  if (source === 'custom_avg_h2h' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[custom?.gAIdx ?? 7] || sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[custom?.gBIdx ?? 3] || sheetData.allTeamsFull[1];
  } else if (source === 'day_top2_avg' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[1];
  }

  // Resolve Drive Logo for each team with full tag & name coverage
  const teamLogoMap: Record<string, string> = {};
  const registerLogo = (tag?: string, name?: string, url?: string) => {
    if (!url) return;
    if (tag) {
      teamLogoMap[tag.toUpperCase()] = url;
      teamLogoMap[tag.toLowerCase()] = url;
      teamLogoMap[tag] = url;
    }
    if (name) {
      teamLogoMap[name.toUpperCase()] = url;
      teamLogoMap[name.toLowerCase()] = url;
      teamLogoMap[name] = url;
    }
  };

  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => registerLogo(st.tag, st.name, st.logoUrl));
  }
  if (sheetData?.allTeamsFull) {
    sheetData.allTeamsFull.forEach((t) => registerLogo(t.tag, t.name, t.logoUrl));
  }

  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const R_IN = 36;
  const CIRC_IN = 2 * Math.PI * R_IN;

  const cards = [
    { title: 'AVG ELIMS / MATCH', va: a.avgElims, vb: b.avgElims, max: 20, suf: '', dec: 1 },
    { title: 'AVG DAMAGE / MATCH', va: Math.round(a.avgDmg), vb: Math.round(b.avgDmg), max: 12000, suf: '', dec: 0 },
    { title: 'AVG SURVIVAL (MIN)', va: a.avgSurvMin, vb: b.avgSurvMin, max: 18, suf: 'm', dec: 1 },
  ];

  // 60fps Smooth Count-Up & Ring Bloom Animation
  useEffect(() => {
    setAnimated(false);
    setDisplayVals([
      { a: 0, b: 0 },
      { a: 0, b: 0 },
      { a: 0, b: 0 },
    ]);

    let rafId: number;
    let start: number | null = null;
    const duration = 1400;

    const timer = setTimeout(() => {
      setAnimated(true);

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const curProgress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - curProgress, 3);

        setDisplayVals([
          { a: cards[0].va * ease, b: cards[0].vb * ease },
          { a: cards[1].va * ease, b: cards[1].vb * ease },
          { a: cards[2].va * ease, b: cards[2].vb * ease },
        ]);

        if (curProgress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };

      rafId = requestAnimationFrame(step);
    }, 150);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [replayKey, a.avgElims, b.avgElims, a.avgDmg, b.avgDmg, a.avgSurvMin, b.avgSurvMin]);

  const colA = themeS4.teamA;
  const colB = themeS4.teamB;
  const winnerTeam = b.avgDmg >= a.avgDmg ? 'b' : 'a';

  return (
    <div className="w-full max-w-[1340px] pt-18 relative font-hud select-none">
      {/* Top Team Header Badges */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex justify-between items-center text-sm sm:text-base font-bold font-hud z-30">
        <div
          id="m14-team-a"
          className={`px-3 py-1 rounded-lg text-white inline-flex items-center gap-2.5 shadow-xl relative cursor-pointer transition-all duration-500 ${
            winnerTeam === 'a' && animated ? 'top1-hero-glow fire-winner-card top1-scale' : ''
          }`}
          style={{
            backgroundColor: colA,
            transform: animated ? 'translateY(0)' : 'translateY(-12px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamA', `${a.name} Color`)}
        >
          {winnerTeam === 'a' && <SpiritFireCanvas />}
          <TeamLogoBadge
            tag={a.tag}
            name={a.name}
            logoUrl={teamLogoMap[a.tag.toUpperCase()] || teamLogoMap[a.name.toUpperCase()]}
            color={colA}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="truncate max-w-[160px]">{a.name}</span>
        </div>

        <div
          id="m14-team-b"
          className={`px-3 py-1 rounded-lg text-slate-950 inline-flex items-center gap-2.5 shadow-xl ml-auto relative cursor-pointer transition-all duration-500 ${
            winnerTeam === 'b' && animated ? 'top1-hero-glow fire-winner-card top1-scale' : ''
          }`}
          style={{
            backgroundColor: colB,
            transform: animated ? 'translateY(0)' : 'translateY(-12px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamB', `${b.name} Color`)}
        >
          {winnerTeam === 'b' && <SpiritFireCanvas />}
          <span className="truncate max-w-[160px]">{b.name}</span>
          <TeamLogoBadge
            tag={b.tag}
            name={b.name}
            logoUrl={teamLogoMap[b.tag.toUpperCase()] || teamLogoMap[b.name.toUpperCase()]}
            color={colB}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
        </div>
      </div>

      {/* 3 Metric Cards with Dual Concentric Circular Gauges & Pulsing Neon Lights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const fracA = Math.min(1, c.va / c.max);
          const fracB = Math.min(1, c.vb / c.max);

          return (
            <div
              key={c.title}
              className="hud-card rounded-2xl p-6 flex flex-col items-center bg-slate-950/80 border border-purple-500/30 shadow-2xl transition-all duration-700"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
                transition: `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.12}s, opacity 0.5s ease ${i * 0.12}s`,
              }}
            >
              <div className="font-hud text-lg font-extrabold text-slate-200 tracking-wider mb-4">
                {c.title}
              </div>

              <svg viewBox="0 0 140 140" className="w-56 h-56 sm:w-64 sm:h-64 overflow-visible">
                {/* Outer Ring Background Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="11"
                />
                {/* Outer Ring (Team A) with Live Neon Pulse Glow */}
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={colA}
                  strokeWidth="11"
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="arc-sweep ring-neon-glow"
                  style={{
                    color: colA,
                    strokeDasharray: `${CIRC} ${CIRC}`,
                    strokeDashoffset: animated ? CIRC * (1 - fracA) : CIRC,
                    transition: `stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.12}s`,
                    animationDelay: `${i * 0.25}s`,
                  }}
                />

                {/* Inner Ring Background Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={R_IN}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="11"
                />
                {/* Inner Ring (Team B) with Live Neon Pulse Glow */}
                <circle
                  cx="70"
                  cy="70"
                  r={R_IN}
                  fill="none"
                  stroke={colB}
                  strokeWidth="11"
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="arc-sweep ring-neon-glow"
                  style={{
                    color: colB,
                    strokeDasharray: `${CIRC_IN} ${CIRC_IN}`,
                    strokeDashoffset: animated ? CIRC_IN * (1 - fracB) : CIRC_IN,
                    transition: `stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1) ${0.18 + i * 0.12}s`,
                    animationDelay: `${0.15 + i * 0.25}s`,
                  }}
                />
              </svg>

              {/* Exact Full Comma Numbers with Smooth 60fps Count-up */}
              <div className="w-full flex justify-between mt-4 pt-3 border-t border-white/15 font-hud text-2xl sm:text-3xl font-extrabold">
                <span style={{ color: colA }}>
                  {c.dec > 0
                    ? displayVals[i].a.toFixed(c.dec)
                    : formatNumber(Math.round(displayVals[i].a))}
                  {c.suf}
                </span>
                <span style={{ color: colB }}>
                  {c.dec > 0
                    ? displayVals[i].b.toFixed(c.dec)
                    : formatNumber(Math.round(displayVals[i].b))}
                  {c.suf}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
