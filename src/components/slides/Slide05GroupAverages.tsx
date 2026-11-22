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
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    setAnimated(false);
    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
        hasAnimatedRef.current = true;
      }, 120);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(rafId);
  }, [replayKey]);

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

  // Resolve Drive Logo for each team
  const teamLogoMap: Record<string, string> = {};
  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => {
      if (st.logoUrl) {
        teamLogoMap[st.tag.toUpperCase()] = st.logoUrl;
        teamLogoMap[st.name.toUpperCase()] = st.logoUrl;
      }
    });
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

  const colA = themeS4.teamA;
  const colB = themeS4.teamB;
  const winnerTeam = b.avgDmg >= a.avgDmg ? 'b' : 'a';

  return (
    <div className="w-full max-w-[1340px] pt-18 relative font-hud select-none">
      {/* Top Team Header Badges with 64px Logos */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex justify-between items-center text-2xl sm:text-3xl font-bold font-hud z-30">
        <div
          id="m14-team-a"
          className="px-4 py-1.5 rounded-xl bg-violet-600/90 text-white inline-flex items-center gap-3.5 shadow-xl relative cursor-pointer"
          style={{ backgroundColor: colA }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamA', `${a.name} Color`)}
        >
          {winnerTeam === 'a' && <SpiritFireCanvas />}
          <TeamLogoBadge
            tag={a.tag}
            name={a.name}
            logoUrl={teamLogoMap[a.tag.toUpperCase()] || teamLogoMap[a.name.toUpperCase()]}
            color={colA}
            sizeCls="w-16 h-16"
          />
          <span>{a.name}</span>
        </div>

        <div
          id="m14-team-b"
          className="px-4 py-1.5 rounded-xl bg-teal-400/90 text-slate-950 inline-flex items-center gap-3.5 shadow-xl ml-auto relative cursor-pointer"
          style={{ backgroundColor: colB }}
          onClick={(e) => onElementClick?.(e, 's4', 'teamB', `${b.name} Color`)}
        >
          {winnerTeam === 'b' && <SpiritFireCanvas />}
          <span>{b.name}</span>
          <TeamLogoBadge
            tag={b.tag}
            name={b.name}
            logoUrl={teamLogoMap[b.tag.toUpperCase()] || teamLogoMap[b.name.toUpperCase()]}
            color={colB}
            sizeCls="w-16 h-16"
          />
        </div>
      </div>

      {/* 3 Metric Cards with Dual Concentric Circular Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const fracA = Math.min(1, c.va / c.max);
          const fracB = Math.min(1, c.vb / c.max);
          const targetOffsetA = CIRC * (1 - fracA);
          const targetOffsetB = CIRC_IN * (1 - fracB);

          return (
            <div
              key={c.title}
              className="hud-card rounded-2xl p-6 flex flex-col items-center bg-slate-950/80 border border-purple-500/30 shadow-2xl"
            >
              <div className="font-hud text-lg font-extrabold text-slate-200 tracking-wider mb-4">
                {c.title}
              </div>

              <svg viewBox="0 0 140 140" className="w-56 h-56 sm:w-64 sm:h-64 overflow-visible">
                {/* Outer Ring Background */}
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="11"
                />
                {/* Outer Ring (Team A) */}
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={colA}
                  strokeWidth="11"
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="arc-sweep"
                  style={{
                    strokeDasharray: CIRC,
                    strokeDashoffset: animated ? targetOffsetA : CIRC,
                    transition: `stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1) ${i * 0.15}s`,
                  }}
                />

                {/* Inner Ring Background */}
                <circle
                  cx="70"
                  cy="70"
                  r={R_IN}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="11"
                />
                {/* Inner Ring (Team B) */}
                <circle
                  cx="70"
                  cy="70"
                  r={R_IN}
                  fill="none"
                  stroke={colB}
                  strokeWidth="11"
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="arc-sweep"
                  style={{
                    strokeDasharray: CIRC_IN,
                    strokeDashoffset: animated ? targetOffsetB : CIRC_IN,
                    transition: `stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1) ${0.1 + i * 0.15}s`,
                  }}
                />
              </svg>

              {/* Exact Full Comma Numbers */}
              <div className="w-full flex justify-between mt-4 pt-3 border-t border-white/15 font-hud text-2xl sm:text-3xl font-extrabold">
                <span style={{ color: colA }}>
                  {c.dec > 0 ? c.va.toFixed(c.dec) : formatNumber(c.va)}
                  {c.suf}
                </span>
                <span style={{ color: colB }}>
                  {c.dec > 0 ? c.vb.toFixed(c.dec) : formatNumber(c.vb)}
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
