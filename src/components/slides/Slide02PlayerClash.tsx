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

interface ClashContender {
  badge: string;
  name: string;
  subtitle: string;
  tag: string;
  kills: number;
  damage: number;
  hs: number;
  assist: number;
  logoUrl?: string;
}

export default function Slide02PlayerClash({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const [prevKey, setPrevKey] = useState(replayKey);
  const hasAnimatedRef = useRef(false);

  if (replayKey !== prevKey) {
    setPrevKey(replayKey);
    setAnimated(false);
  }

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
        hasAnimatedRef.current = true;
      }, 150);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(rafId);
  }, [replayKey]);

  const themeS1 = theme?.s1 || { p1: '#8b5cf6', p2: '#2dd4bf', accent: '#fbbf24' };
  const custom = theme?.custom;
  // Main default is Team Head to Head (latest_h2h)
  const source = theme?.sources?.[1] || 'latest_h2h';

  // Resolve Drive Logo for each contender with full tag & name coverage
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

  // --- Contender 1 & 2 Data Resolution ---
  let c1: ClashContender;
  let c2: ClashContender;

  const isPlayerMode = source === 'day_top2_duel' || source === 'custom_duel';

  if (isPlayerMode) {
    // 1v1 Player Clash Mode
    let p1 = sheetData?.duel1v1?.p1 || {
      name: 'LOADING...',
      team: '---',
      tag: '---',
      kills: 0,
      damage: 0,
      hs: 0,
      assist: 0,
    };
    let p2 = sheetData?.duel1v1?.p2 || {
      name: 'LOADING...',
      team: '---',
      tag: '---',
      kills: 0,
      damage: 0,
      hs: 0,
      assist: 0,
    };

    if (source === 'custom_duel' && sheetData?.dayTop10Players?.length) {
      const a = sheetData.dayTop10Players[custom?.p1Idx ?? 0] || sheetData.dayTop10Players[0];
      const b = sheetData.dayTop10Players[custom?.p2Idx ?? 1] || sheetData.dayTop10Players[1];
      p1 = { name: a.name, team: a.team, tag: a.tag, kills: a.kills, damage: a.dmg, hs: a.hs, assist: a.assist };
      p2 = { name: b.name, team: b.team, tag: b.tag, kills: b.kills, damage: b.dmg, hs: b.hs, assist: b.assist };
    }

    c1 = {
      badge: 'CONTENDER 01',
      name: p1.name,
      subtitle: p1.team,
      tag: p1.tag,
      kills: p1.kills,
      damage: p1.damage,
      hs: p1.hs,
      assist: p1.assist,
    };
    c2 = {
      badge: 'CONTENDER 02',
      name: p2.name,
      subtitle: p2.team,
      tag: p2.tag,
      kills: p2.kills,
      damage: p2.damage,
      hs: p2.hs,
      assist: p2.assist,
    };
  } else {
    // Team Head to Head Mode (Main / Default)
    let tA = {
      name: 'LOADING...',
      tag: '---',
      rank: 1,
      kills: 0,
      damage: 0,
      hs: 0,
      assist: 0,
      logoUrl: undefined as string | undefined,
    };
    let tB = {
      name: 'LOADING...',
      tag: '---',
      rank: 2,
      kills: 0,
      damage: 0,
      hs: 0,
      assist: 0,
      logoUrl: undefined as string | undefined,
    };

    if (sheetData?.h2hMatch5?.a && sheetData?.h2hMatch5?.b) {
      tA = {
        name: sheetData.h2hMatch5.a.name,
        tag: sheetData.h2hMatch5.a.tag,
        rank: sheetData.h2hMatch5.a.rank,
        kills: sheetData.h2hMatch5.a.kills,
        damage: sheetData.h2hMatch5.a.damage,
        hs: sheetData.h2hMatch5.a.hs,
        assist: sheetData.h2hMatch5.a.assist ?? Math.round(sheetData.h2hMatch5.a.kills * 0.42),
        logoUrl: undefined,
      };
      tB = {
        name: sheetData.h2hMatch5.b.name,
        tag: sheetData.h2hMatch5.b.tag,
        rank: sheetData.h2hMatch5.b.rank,
        kills: sheetData.h2hMatch5.b.kills,
        damage: sheetData.h2hMatch5.b.damage,
        hs: sheetData.h2hMatch5.b.hs,
        assist: sheetData.h2hMatch5.b.assist ?? Math.round(sheetData.h2hMatch5.b.kills * 0.42),
        logoUrl: undefined,
      };
    } else if (sheetData?.allTeamsFull?.length) {
      const first = sheetData.allTeamsFull[0];
      const second = sheetData.allTeamsFull[1] || first;
      tA = {
        name: first.name,
        tag: first.tag,
        rank: first.rank,
        kills: first.kills,
        damage: first.damage,
        hs: first.hs,
        assist: first.assist ?? Math.round(first.kills * 0.42),
        logoUrl: first.logoUrl,
      };
      tB = {
        name: second.name,
        tag: second.tag,
        rank: second.rank,
        kills: second.kills,
        damage: second.damage,
        hs: second.hs,
        assist: second.assist ?? Math.round(second.kills * 0.42),
        logoUrl: second.logoUrl,
      };
    } else if (sheetData?.standing12?.length) {
      const first = sheetData.standing12[0];
      const second = sheetData.standing12[1] || first;
      tA = {
        name: first.name,
        tag: first.tag,
        rank: first.rank,
        kills: first.elims,
        damage: first.damage || 0,
        hs: Math.round(first.elims * 0.38),
        assist: Math.round(first.elims * 0.42),
        logoUrl: first.logoUrl,
      };
      tB = {
        name: second.name,
        tag: second.tag,
        rank: second.rank,
        kills: second.elims,
        damage: second.damage || 0,
        hs: Math.round(second.elims * 0.38),
        assist: Math.round(second.elims * 0.42),
        logoUrl: second.logoUrl,
      };
    }

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
          logoUrl: s.logoUrl,
        }))
      : [
          { rank: 1, name: 'NOCTRYX ESPORTS', tag: 'NTX', kills: 63, damage: 30737, hs: 45, assist: 130 },
          { rank: 2, name: 'iQ LESS', tag: 'iQL', kills: 32, damage: 20341, hs: 32, assist: 48 },
          { rank: 3, name: 'UNKNOWN BLOOD', tag: 'UB', kills: 42, damage: 22100, hs: 35, assist: 38 },
          { rank: 4, name: 'ALCHEMIST', tag: 'ALC', kills: 39, damage: 21500, hs: 31, assist: 34 },
          { rank: 5, name: 'NEXO BLIND', tag: 'NXB', kills: 36, damage: 19800, hs: 28, assist: 30 },
          { rank: 6, name: 'AURA SMT', tag: 'AURA', kills: 31, damage: 17400, hs: 25, assist: 28 },
          { rank: 7, name: 'WIDE YOUTH', tag: 'WY', kills: 28, damage: 16200, hs: 22, assist: 24 },
          { rank: 8, name: 'NO SYMPATHY', tag: 'NSP', kills: 22, damage: 20106, hs: 30, assist: 56 },
          { rank: 9, name: '6S BY AG', tag: '6S', kills: 24, damage: 14500, hs: 19, assist: 21 },
          { rank: 10, name: 'POWER OF BGX', tag: 'BGX', kills: 20, damage: 13200, hs: 16, assist: 18 },
          { rank: 11, name: 'DRAKEBORN', tag: 'DRK', kills: 18, damage: 11800, hs: 14, assist: 16 },
          { rank: 12, name: 'EXTREME EX', tag: 'EXE', kills: 76, damage: 42349, hs: 67, assist: 32 },
        ];

    if (source === 'custom_h2h') {
      const idxA = custom?.tAIdx ?? 1;
      const idxB = custom?.tBIdx ?? 7;
      const first = allTeams[idxA] || allTeams[0];
      const second = allTeams[idxB] || allTeams[1] || first;
      tA = {
        name: first.name,
        tag: first.tag,
        rank: first.rank,
        kills: (first as any).kills ?? (first as any).elims ?? 0,
        damage: first.damage ?? 0,
        hs: first.hs ?? Math.round(((first as any).kills || 0) * 0.38),
        assist: (first as any).assist ?? Math.round(((first as any).kills || 0) * 0.42),
        logoUrl: (first as any).logoUrl,
      };
      tB = {
        name: second.name,
        tag: second.tag,
        rank: second.rank,
        kills: (second as any).kills ?? (second as any).elims ?? 0,
        damage: second.damage ?? 0,
        hs: second.hs ?? Math.round(((second as any).kills || 0) * 0.38),
        assist: (second as any).assist ?? Math.round(((second as any).kills || 0) * 0.42),
        logoUrl: (second as any).logoUrl,
      };
    } else if (source === 'day_top2_h2h') {
      const first = allTeams[0];
      const second = allTeams[1] || first;
      tA = {
        name: first.name,
        tag: first.tag,
        rank: first.rank,
        kills: (first as any).kills ?? (first as any).elims ?? 0,
        damage: first.damage ?? 0,
        hs: first.hs ?? Math.round(((first as any).kills || 0) * 0.38),
        assist: (first as any).assist ?? Math.round(((first as any).kills || 0) * 0.42),
        logoUrl: (first as any).logoUrl,
      };
      tB = {
        name: second.name,
        tag: second.tag,
        rank: second.rank,
        kills: (second as any).kills ?? (second as any).elims ?? 0,
        damage: second.damage ?? 0,
        hs: second.hs ?? Math.round(((second as any).kills || 0) * 0.38),
        assist: (second as any).assist ?? Math.round(((second as any).kills || 0) * 0.42),
        logoUrl: (second as any).logoUrl,
      };
    }

    c1 = {
      badge: `TEAM 01${tA.rank ? ' • RANK #' + tA.rank : ''}`,
      name: tA.name,
      subtitle: tA.tag,
      tag: tA.tag,
      kills: tA.kills,
      damage: tA.damage,
      hs: tA.hs,
      assist: tA.assist,
      logoUrl: tA.logoUrl,
    };
    c2 = {
      badge: `TEAM 02${tB.rank ? ' • RANK #' + tB.rank : ''}`,
      name: tB.name,
      subtitle: tB.tag,
      tag: tB.tag,
      kills: tB.kills,
      damage: tB.damage,
      hs: tB.hs,
      assist: tB.assist,
      logoUrl: tB.logoUrl,
    };
  }

  // Exact 4 metrics requested by user: Eliminations, Total Damage, Headshots, Assists
  const rows = [
    { label: 'ELIMINATIONS', a: c1.kills, b: c2.kills },
    { label: 'TOTAL DAMAGE', a: c1.damage, b: c2.damage },
    { label: 'HEADSHOTS', a: c1.hs, b: c2.hs },
    { label: 'ASSISTS', a: c1.assist, b: c2.assist },
  ];

  // Comparative power score for the laser meter
  const s1 = (c1.kills || 0) * 100 + (c1.damage || 0) * 0.1 + (c1.hs || 0) * 40 + (c1.assist || 0) * 25;
  const s2 = (c2.kills || 0) * 100 + (c2.damage || 0) * 0.1 + (c2.hs || 0) * 40 + (c2.assist || 0) * 25;
  const pct1 = Math.min(95, Math.max(5, Math.round((s1 / (s1 + s2 || 1)) * 100)));
  const pct2 = 100 - pct1;

  const R = 125;
  const CX = 180;
  const CY = 170;
  const ARC = Math.PI * R;
  const theta = Math.PI * (1 - pct1 / 100);
  const px = CX + R * Math.cos(theta);
  const py = CY - R * Math.sin(theta);

  const winnerSide = s1 >= s2 ? 'p1' : 'p2';

  return (
    <div className="w-full max-w-[1340px] space-y-5 font-hud select-none">
      {/* Top Contender Header Plates */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4 w-full">
        {/* Contender 1 Card */}
        <div
          id="s3-card-p1"
          className="dark-box rounded-lg px-3 py-1.5 border-l-4 text-left relative transition-all duration-700 w-fit max-w-[280px]"
          style={{ borderLeftColor: themeS1.p1 }}
          onClick={(e) => onElementClick?.(e, 's1', 'p1', `${c1.name} Color`)}
        >
          {winnerSide === 'p1' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-2.5">
            <TeamLogoBadge
              tag={c1.tag}
              name={c1.name}
              logoUrl={teamLogoMap[c1.tag.toUpperCase()] || teamLogoMap[c1.name.toUpperCase()] || c1.logoUrl}
              color={themeS1.p1}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: themeS1.p1 }}
              >
                {c1.badge}
              </div>
              <div className="font-hud text-base sm:text-lg font-extrabold text-white leading-tight truncate max-w-[150px]">
                {c1.name}
              </div>
              <div className="text-[11px] font-bold text-slate-300">{c1.subtitle}</div>
            </div>
          </div>
        </div>

        {/* Contender 2 Card */}
        <div
          id="s3-card-p2"
          className="dark-box rounded-lg px-3 py-1.5 border-r-4 text-right relative transition-all duration-700 w-fit max-w-[280px] ml-auto"
          style={{ borderRightColor: themeS1.p2 }}
          onClick={(e) => onElementClick?.(e, 's1', 'p2', `${c2.name} Color`)}
        >
          {winnerSide === 'p2' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-2.5">
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: themeS1.p2 }}
              >
                {c2.badge}
              </div>
              <div className="font-hud text-base sm:text-lg font-extrabold text-white leading-tight truncate max-w-[150px]">
                {c2.name}
              </div>
              <div className="text-[11px] font-bold text-slate-300">{c2.subtitle}</div>
            </div>
            <TeamLogoBadge
              tag={c2.tag}
              name={c2.name}
              logoUrl={teamLogoMap[c2.tag.toUpperCase()] || teamLogoMap[c2.name.toUpperCase()] || c2.logoUrl}
              color={themeS1.p2}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
          </div>
        </div>
      </div>

      {/* Pure Black (#000000) Gauge Track + Laser Arc */}
      <div className="relative flex flex-col items-center -mt-4">
        <svg viewBox="0 0 360 195" className="w-full max-w-[460px] overflow-visible">
          {/* Gauge Tick marks */}
          {Array.from({ length: 25 }).map((_, i) => {
            const th = Math.PI * (1 - i / 24);
            const isMajor = i % 6 === 0;
            const x1 = (CX + (R + 20) * Math.cos(th)).toFixed(1);
            const y1 = (CY - (R + 20) * Math.sin(th)).toFixed(1);
            const x2 = (CX + (R + (isMajor ? 30 : 25)) * Math.cos(th)).toFixed(1);
            const y2 = (CY - (R + (isMajor ? 30 : 25)) * Math.sin(th)).toFixed(1);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? '#000000' : 'rgba(0,0,0,0.45)'}
                strokeWidth={isMajor ? 3 : 1.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Pure Black Backing Track */}
          <path
            d="M 55 170 A 125 125 0 0 1 305 170"
            fill="none"
            stroke="#000000"
            strokeWidth="34"
          />

          {/* Player 1 Laser Arc */}
          <path
            d="M 55 170 A 125 125 0 0 1 305 170"
            fill="none"
            stroke={themeS1.p1}
            strokeWidth="24"
            className="arc-sweep"
            style={{
              strokeDasharray: ARC,
              strokeDashoffset: animated ? ARC * (1 - pct1 / 100) : ARC,
              transition: 'stroke-dashoffset 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
            }}
            data-edit-group="s1"
            data-edit-key="p1"
            onClick={(e) => onElementClick?.(e, 's1', 'p1', 'Contender 1 Color')}
          />

          {/* Black Center Dividing Line */}
          <path
            d="M 55 170 A 125 125 0 0 1 305 170"
            fill="none"
            stroke="#000000"
            strokeOpacity="0.92"
            strokeWidth="6"
            className="energy-line"
          />

          {/* Player 2 Laser Arc */}
          <path
            d="M 305 170 A 125 125 0 0 0 55 170"
            fill="none"
            stroke={themeS1.p2}
            strokeWidth="24"
            className="arc-sweep"
            style={{
              strokeDasharray: ARC,
              strokeDashoffset: animated ? ARC * (1 - pct2 / 100) : ARC,
              transition: 'stroke-dashoffset 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
            }}
            data-edit-group="s1"
            data-edit-key="p2"
            onClick={(e) => onElementClick?.(e, 's1', 'p2', 'Contender 2 Color')}
          />

          {/* Scanner Needle */}
          <line
            x1="180"
            y1="170"
            x2="180"
            y2="26"
            stroke="#000000"
            strokeWidth="3.5"
            strokeLinecap="round"
            className={animated ? 'scanner-run' : 'opacity-0'}
          />

          {/* Shockwave Burst */}
          <circle
            cx={px.toFixed(1)}
            cy={py.toFixed(1)}
            r="6"
            fill="none"
            stroke="#000000"
            className={animated ? 'shock-run' : 'opacity-0'}
          />

          {/* Spark Indicator */}
          <circle
            cx={animated ? px.toFixed(1) : '55'}
            cy={animated ? py.toFixed(1) : '170'}
            r="8"
            fill="#000000"
            stroke="#000000"
            strokeWidth="2"
            style={{
              transition:
                'cx 1.85s cubic-bezier(0.22, 1.08, 0.36, 1), cy 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
            }}
          />
        </svg>

        {/* Center Percentage VS Display */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <div className="px-6 py-1.5 rounded-xl bg-slate-950/95 border border-purple-400/50 font-hud text-3xl sm:text-4xl font-extrabold text-white shadow-2xl flex items-center">
            <span
              className="cursor-pointer hover:opacity-80"
              style={{ color: themeS1.p1 }}
              onClick={(e) => onElementClick?.(e, 's1', 'p1', `${c1.name} Color`)}
            >
              {animated ? `${pct1}%` : '0%'}
            </span>
            <span
              className="text-amber-400 text-base mx-2 cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => onElementClick?.(e, 's1', 'accent', 'Accent Color')}
            >
              VS
            </span>
            <span
              className="cursor-pointer hover:opacity-80"
              style={{ color: themeS1.p2 }}
              onClick={(e) => onElementClick?.(e, 's1', 'p2', `${c2.name} Color`)}
            >
              {animated ? `${pct2}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Rows with Full Exact Numbers (Zero 'K') */}
      <div className="space-y-3.5 max-w-4xl mx-auto">
        {rows.map((r, idx) => {
          const rowMax = Math.max(r.a, r.b, 1) * 1.06;
          const wA = Math.max(24, Math.round((r.a / rowMax) * 100));
          const wB = Math.max(24, Math.round((r.b / rowMax) * 100));

          return (
            <div
              key={r.label}
              className="skew-box bg-slate-950/95 border border-white/20 rounded-xl overflow-hidden shadow-2xl"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated
                  ? 'skewX(-10deg) translateY(0) scaleX(1)'
                  : 'skewX(-10deg) translateY(24px) scaleX(0.32)',
                transition: `opacity 0.5s ease ${0.2 + idx * 0.15}s, transform 0.65s cubic-bezier(0.22, 1.12, 0.36, 1) ${0.2 + idx * 0.15}s`,
              }}
            >
              <div className="relative flex items-center h-14 w-full px-2 gap-2">
                {/* Left Side: Number pinned left, Bar grows from center-left */}
                <div
                  className="relative flex-1 h-full flex items-center justify-end overflow-hidden cursor-pointer rounded-l-md"
                  onClick={(e) => onElementClick?.(e, 's1', 'p1', `${c1.name} Bar Color`)}
                >
                  <div
                    className="bar-live h-full rounded-l-md"
                    style={{
                      backgroundColor: themeS1.p1,
                      width: animated ? `${wA}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  />
                  <span className="unskew absolute left-3 z-10 font-hud font-extrabold text-2xl sm:text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {formatNumber(r.a)}
                  </span>
                </div>

                {/* Dedicated Center Stat Title Badge (Never overlaps numbers) */}
                <div className="shrink-0 z-20 flex items-center justify-center">
                  <span
                    className="unskew px-3.5 py-1 rounded-md text-xs sm:text-sm font-extrabold tracking-widest border shadow-lg cursor-pointer hover:scale-105 transition-transform whitespace-nowrap"
                    style={{
                      color: themeS1.accent,
                      borderColor: themeS1.accent,
                      backgroundColor: 'var(--ui-box-bg, #0a0c16)',
                    }}
                    onClick={(e) => onElementClick?.(e, 's1', 'accent', 'Accent Color')}
                    title="Click to change accent color"
                  >
                    {r.label}
                  </span>
                </div>

                {/* Right Side: Number pinned right, Bar grows from center-right */}
                <div
                  className="relative flex-1 h-full flex items-center justify-start overflow-hidden cursor-pointer rounded-r-md"
                  onClick={(e) => onElementClick?.(e, 's1', 'p2', `${c2.name} Bar Color`)}
                >
                  <div
                    className="bar-live h-full rounded-r-md"
                    style={{
                      backgroundColor: themeS1.p2,
                      width: animated ? `${wB}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  />
                  <span className="unskew absolute right-3 z-10 font-hud font-extrabold text-2xl sm:text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {formatNumber(r.b)}
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
