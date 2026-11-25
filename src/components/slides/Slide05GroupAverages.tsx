'use client';

import React, { useEffect, useState } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

const DEFAULT_ALL_TEAMS = Array.from({ length: 12 }, (_, idx) => ({
  rank: idx + 1,
  name: 'LOADING...',
  tag: '---',
  kills: 0,
  damage: 0,
  hs: 0,
  assist: 0,
  surv: 0,
  total: 0,
}));

export default function Slide05GroupAverages({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const [displayVals, setDisplayVals] = useState([
    { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
    { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
    { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
  ]);

  const themeS4 = theme?.s4 || { teamA: '#8b5cf6', teamB: '#2dd4bf' };
  const custom = theme?.custom;
  const source = theme?.sources?.[3] || theme?.sources?.[4] || 'custom_avg_h2h';

  // Available teams pool combining sheetData.allTeamsFull, sheetData.standing12 and standard defaults
  const allTeams = (sheetData?.allTeamsFull && sheetData.allTeamsFull.length > 0)
    ? sheetData.allTeamsFull
    : (sheetData?.standing12 && sheetData.standing12.length > 0)
    ? sheetData.standing12.map((s, idx) => ({
        rank: s.rank || idx + 1,
        tag: s.tag,
        name: s.name,
        kills: s.elims,
        damage: s.damage || 0,
        hs: Math.round(s.elims * 0.38),
        assist: Math.round(s.elims * 0.42),
        surv: s.place,
        total: s.total,
        logoUrl: s.logoUrl,
      }))
    : DEFAULT_ALL_TEAMS;

  // Resolve Team A & Team B based on custom indices or defaults
  const idxA = custom?.gAIdx ?? 1; // Default to #2 iQ LESS
  const idxB = custom?.gBIdx ?? 7; // Default to #8 NO SYMPATHY

  let rawA: any = allTeams[idxA] || allTeams[0];
  let rawB: any = allTeams[idxB] || allTeams[1] || rawA;

  if (source === 'day_top2_avg' && allTeams.length >= 2) {
    rawA = allTeams[0];
    rawB = allTeams[1];
  } else if (source === 'group_avg_h2h' && sheetData?.h2hGroupAvg?.a && sheetData?.h2hGroupAvg?.b) {
    // If standard group average data is available, preserve team names
    const matchA = allTeams.find((t) => t.tag === sheetData.h2hGroupAvg.a.tag || t.name === sheetData.h2hGroupAvg.a.name);
    const matchB = allTeams.find((t) => t.tag === sheetData.h2hGroupAvg.b.tag || t.name === sheetData.h2hGroupAvg.b.name);
    if (matchA) rawA = matchA;
    if (matchB) rawB = matchB;
  }

  const a = {
    name: rawA.name,
    tag: rawA.tag,
    rank: rawA.rank,
    kills: rawA.kills ?? rawA.elims ?? 0,
    damage: rawA.damage ?? 0,
    hs: rawA.hs ?? Math.round((rawA.kills || 0) * 0.38),
    assist: rawA.assist ?? Math.round((rawA.kills || 0) * 0.44),
    surv: rawA.surv ?? rawA.place ?? 0,
    total: rawA.total ?? 0,
    logoUrl: rawA.logoUrl,
  };

  const b = {
    name: rawB.name,
    tag: rawB.tag,
    rank: rawB.rank,
    kills: rawB.kills ?? rawB.elims ?? 0,
    damage: rawB.damage ?? 0,
    hs: rawB.hs ?? Math.round((rawB.kills || 0) * 0.38),
    assist: rawB.assist ?? Math.round((rawB.kills || 0) * 0.44),
    surv: rawB.surv ?? rawB.place ?? 0,
    total: rawB.total ?? 0,
    logoUrl: rawB.logoUrl,
  };

  // Resolve Drive Logo for each team
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

  // 3 Requested Cards:
  // 1: HEADSHOTS & ASSISTS (Left)
  // 2: ELIMINATIONS & DAMAGE (Center / Middle)
  // 3: SURVIVAL & TOTAL POINTS (Right)
  const cards = [
    {
      title: 'HEADSHOTS & ASSISTS',
      badge: 'PRECISION & TEAMPLAY',
      m1Label: 'HEADSHOTS',
      m1A: a.hs,
      m1B: b.hs,
      m2Label: 'ASSISTS',
      m2A: a.assist,
      m2B: b.assist,
      scoreA: a.hs * 50 + a.assist * 30,
      scoreB: b.hs * 50 + b.assist * 30,
      accent: '#EC008C',
    },
    {
      title: 'ELIMINATIONS & DAMAGE',
      badge: 'COMBAT POWER',
      m1Label: 'KILLS',
      m1A: a.kills,
      m1B: b.kills,
      m2Label: 'DAMAGE',
      m2A: a.damage,
      m2B: b.damage,
      scoreA: a.kills * 100 + a.damage * 0.1,
      scoreB: b.kills * 100 + b.damage * 0.1,
      accent: '#F5B700',
    },
    {
      title: 'SURVIVAL & TOTAL POINTS',
      badge: 'STANDINGS & PLACEMENT',
      m1Label: 'SURVIVAL',
      m1A: a.surv,
      m1B: b.surv,
      m2Label: 'TOTAL PTS',
      m2A: a.total,
      m2B: b.total,
      scoreA: a.surv * 2 + a.total * 3,
      scoreB: b.surv * 2 + b.total * 3,
      accent: '#00DF82',
    },
  ];

  // 60fps Smooth Count-Up & Ring Bloom Animation
  useEffect(() => {
    setAnimated(false);
    setDisplayVals([
      { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
      { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
      { m1A: 0, m1B: 0, m2A: 0, m2B: 0 },
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
          {
            m1A: cards[0].m1A * ease,
            m1B: cards[0].m1B * ease,
            m2A: cards[0].m2A * ease,
            m2B: cards[0].m2B * ease,
          },
          {
            m1A: cards[1].m1A * ease,
            m1B: cards[1].m1B * ease,
            m2A: cards[1].m2A * ease,
            m2B: cards[1].m2B * ease,
          },
          {
            m1A: cards[2].m1A * ease,
            m1B: cards[2].m1B * ease,
            m2A: cards[2].m2A * ease,
            m2B: cards[2].m2B * ease,
          },
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
  }, [replayKey, a.kills, b.kills, a.damage, b.damage, a.hs, b.hs, a.assist, b.assist, a.surv, b.surv, a.total, b.total]);

  const colA = themeS4.teamA;
  const colB = themeS4.teamB;
  const winnerTeam = b.total >= a.total ? 'b' : 'a';

  return (
    <div className="w-full max-w-[1340px] pt-18 relative font-hud select-none">
      {/* Top Team Header Badges */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex justify-between items-center text-sm sm:text-base font-bold font-hud z-30">
        <div
          id="m14-team-a"
          className="px-3.5 py-1.5 rounded-xl text-white inline-flex items-center gap-2.5 relative cursor-pointer transition-all duration-500 border border-white/25"
          style={{
            backgroundColor: colA,
            transform: animated ? 'translateY(0)' : 'translateY(-12px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamA', `${a.name} Color`)}
          title={`Click to change ${a.name} color`}
        >
          <TeamLogoBadge
            tag={a.tag}
            name={a.name}
            logoUrl={a.logoUrl || teamLogoMap[a.tag.toUpperCase()] || teamLogoMap[a.name.toUpperCase()]}
            color={colA}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div className="flex flex-col text-left">
            <span className="truncate max-w-[170px] text-sm sm:text-base font-extrabold leading-tight">{a.name}</span>
            <span className="text-[10px] text-white/80 font-bold tracking-wider">{a.tag} • RANK #{a.rank}</span>
          </div>
        </div>

        <div
          id="m14-team-b"
          className="px-3.5 py-1.5 rounded-xl text-slate-950 inline-flex items-center gap-2.5 ml-auto relative cursor-pointer transition-all duration-500 border border-white/25"
          style={{
            backgroundColor: colB,
            transform: animated ? 'translateY(0)' : 'translateY(-12px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamB', `${b.name} Color`)}
          title={`Click to change ${b.name} color`}
        >
          <div className="flex flex-col text-right">
            <span className="truncate max-w-[170px] text-sm sm:text-base font-extrabold leading-tight text-slate-950">{b.name}</span>
            <span className="text-[10px] text-slate-900/80 font-bold tracking-wider">{b.tag} • RANK #{b.rank}</span>
          </div>
          <TeamLogoBadge
            tag={b.tag}
            name={b.name}
            logoUrl={b.logoUrl || teamLogoMap[b.tag.toUpperCase()] || teamLogoMap[b.name.toUpperCase()]}
            color={colB}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
        </div>
      </div>

      {/* 3 Metric Cards with Dual Concentric Circular Gauges & Pulsing Neon Lights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const maxScore = Math.max(c.scoreA, c.scoreB, 1);
          const fracA = Math.max(0.12, Math.min(1, c.scoreA / maxScore));
          const fracB = Math.max(0.12, Math.min(1, c.scoreB / maxScore));

          return (
            <div
              key={c.title}
              className="hud-card rounded-2xl p-5 sm:p-6 flex flex-col items-center bg-transparent border border-white/25 transition-all duration-700 hover:border-amber-400/60"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
                transition: `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.12}s, opacity 0.5s ease ${i * 0.12}s`,
              }}
            >
              {/* Card Header Title & Badge */}
              <div className="text-center mb-3">
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-amber-300 font-hud text-[10px] font-extrabold tracking-widest uppercase">
                  {c.badge}
                </span>
                <div className="font-hud text-base sm:text-lg font-extrabold text-white tracking-wider mt-1">
                  {c.title}
                </div>
              </div>

              {/* Dual Concentric Circular SVG Rings */}
              <svg viewBox="0 0 140 140" className="w-52 h-52 sm:w-60 sm:h-60 overflow-visible">
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
                  className="arc-sweep ring-neon-glow cursor-pointer hover:opacity-85"
                  style={{
                    color: colA,
                    strokeDasharray: `${CIRC} ${CIRC}`,
                    strokeDashoffset: animated ? CIRC * (1 - fracA) : CIRC,
                    transition: `stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + i * 0.12}s`,
                    animationDelay: `${i * 0.25}s`,
                  }}
                  onClick={(e) => onElementClick?.(e, 's4', 'teamA', `${a.name} Ring`)}
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
                  className="arc-sweep ring-neon-glow cursor-pointer hover:opacity-85"
                  style={{
                    color: colB,
                    strokeDasharray: `${CIRC_IN} ${CIRC_IN}`,
                    strokeDashoffset: animated ? CIRC_IN * (1 - fracB) : CIRC_IN,
                    transition: `stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1) ${0.18 + i * 0.12}s`,
                    animationDelay: `${0.15 + i * 0.25}s`,
                  }}
                  onClick={(e) => onElementClick?.(e, 's4', 'teamB', `${b.name} Ring`)}
                />

                {/* Center High-Tech VS Emblem */}
                <g transform="translate(70,70)">
                  <circle cx="0" cy="0" r="18" fill="#0b0f1d" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fill="#F5B700"
                    fontFamily="inherit"
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    VS
                  </text>
                </g>
              </svg>

              {/* Exact Metrics Data Display (Left Team A vs Right Team B) */}
              <div className="w-full mt-3 pt-3 border-t border-white/15 space-y-2">
                {/* Metric 1 (e.g. KILLS / HEADSHOTS / SURVIVAL) */}
                <div className="flex justify-between items-center text-xs sm:text-sm font-hud">
                  <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5" style={{ color: colA }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colA }} />
                    {formatNumber(Math.round(displayVals[i].m1A))}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {c.m1Label}
                  </span>
                  <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5" style={{ color: colB }}>
                    {formatNumber(Math.round(displayVals[i].m1B))}
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colB }} />
                  </span>
                </div>

                {/* Metric 2 (e.g. DAMAGE / ASSISTS / TOTAL PTS) */}
                <div className="flex justify-between items-center text-xs sm:text-sm font-hud">
                  <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5" style={{ color: colA }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colA }} />
                    {formatNumber(Math.round(displayVals[i].m2A))}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {c.m2Label}
                  </span>
                  <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5" style={{ color: colB }}>
                    {formatNumber(Math.round(displayVals[i].m2B))}
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colB }} />
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
