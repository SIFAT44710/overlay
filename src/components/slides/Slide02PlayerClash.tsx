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

interface H2HContender {
  name: string;
  tag: string;
  rank?: number;
  total?: number;
  kills?: number;
  damage?: number;
  hs?: number;
  surv?: number;
  gloo?: number;
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
  const source = theme?.sources?.[1] || 'latest_h2h';

  // Determine Team 1 (A) and Team 2 (B) based on selected source / custom pickers
  let tA: H2HContender = {
    name: 'EXTREME EX',
    tag: 'EXE',
    rank: 2,
    total: 98,
    kills: 76,
    damage: 42349,
    hs: 67,
    surv: 22,
    gloo: 340,
  };

  let tB: H2HContender = {
    name: '69 ESPORTS',
    tag: '69',
    rank: 8,
    total: 61,
    kills: 48,
    damage: 27036,
    hs: 46,
    surv: 13,
    gloo: 185,
  };

  if (sheetData?.h2hMatch5?.a && sheetData?.h2hMatch5?.b) {
    tA = {
      name: sheetData.h2hMatch5.a.name,
      tag: sheetData.h2hMatch5.a.tag,
      rank: sheetData.h2hMatch5.a.rank,
      total: sheetData.h2hMatch5.a.total,
      kills: sheetData.h2hMatch5.a.kills,
      damage: sheetData.h2hMatch5.a.damage,
      hs: sheetData.h2hMatch5.a.hs,
      surv: sheetData.h2hMatch5.a.surv,
      gloo: sheetData.h2hMatch5.a.gloo,
      logoUrl: undefined,
    };
    tB = {
      name: sheetData.h2hMatch5.b.name,
      tag: sheetData.h2hMatch5.b.tag,
      rank: sheetData.h2hMatch5.b.rank,
      total: sheetData.h2hMatch5.b.total,
      kills: sheetData.h2hMatch5.b.kills,
      damage: sheetData.h2hMatch5.b.damage,
      hs: sheetData.h2hMatch5.b.hs,
      surv: sheetData.h2hMatch5.b.surv,
      gloo: sheetData.h2hMatch5.b.gloo,
      logoUrl: undefined,
    };
  } else if (sheetData?.allTeamsFull?.length) {
    const first = sheetData.allTeamsFull[0];
    const second = sheetData.allTeamsFull[1] || first;
    tA = {
      name: first.name,
      tag: first.tag,
      rank: first.rank,
      total: first.total,
      kills: first.kills,
      damage: first.damage,
      hs: first.hs,
      surv: first.surv,
      gloo: first.gloo,
      logoUrl: first.logoUrl,
    };
    tB = {
      name: second.name,
      tag: second.tag,
      rank: second.rank,
      total: second.total,
      kills: second.kills,
      damage: second.damage,
      hs: second.hs,
      surv: second.surv,
      gloo: second.gloo,
      logoUrl: second.logoUrl,
    };
  } else if (sheetData?.standing12?.length) {
    const first = sheetData.standing12[0];
    const second = sheetData.standing12[1] || first;
    tA = {
      name: first.name,
      tag: first.tag,
      rank: first.rank,
      total: first.total,
      kills: first.elims,
      damage: first.damage || 0,
      hs: 0,
      surv: first.place,
      gloo: 0,
      logoUrl: first.logoUrl,
    };
    tB = {
      name: second.name,
      tag: second.tag,
      rank: second.rank,
      total: second.total,
      kills: second.elims,
      damage: second.damage || 0,
      hs: 0,
      surv: second.place,
      gloo: 0,
      logoUrl: second.logoUrl,
    };
  }

  if (source === 'day_top2_h2h' && sheetData?.allTeamsFull?.length) {
    const first = sheetData.allTeamsFull[0];
    const second = sheetData.allTeamsFull[1] || first;
    tA = { ...first };
    tB = { ...second };
  } else if (source === 'custom_h2h' && sheetData?.allTeamsFull?.length) {
    const first = sheetData.allTeamsFull[custom?.tAIdx ?? 0] || sheetData.allTeamsFull[0];
    const second = sheetData.allTeamsFull[custom?.tBIdx ?? 1] || sheetData.allTeamsFull[1];
    tA = { ...first };
    tB = { ...second };
  }

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

  const s1 = (tA.total || 0) * 100 + (tA.kills || 0) * 20 + Math.round((tA.damage || 0) * 0.05);
  const s2 = (tB.total || 0) * 100 + (tB.kills || 0) * 20 + Math.round((tB.damage || 0) * 0.05);
  const pct1 = Math.min(95, Math.max(5, Math.round((s1 / (s1 + s2 || 1)) * 100)));
  const pct2 = 100 - pct1;

  const R = 125;
  const CX = 180;
  const CY = 170;
  const ARC = Math.PI * R;
  const theta = Math.PI * (1 - pct1 / 100);
  const px = CX + R * Math.cos(theta);
  const py = CY - R * Math.sin(theta);

  const fourthLabel = (tA.hs || tB.hs) ? 'HEADSHOTS' : (tA.surv || tB.surv) ? 'SURVIVAL POINTS' : 'HEADSHOTS';
  const fourthA = (tA.hs || tB.hs) ? (tA.hs || 0) : (tA.surv || 0);
  const fourthB = (tA.hs || tB.hs) ? (tB.hs || 0) : (tB.surv || 0);

  const rows = [
    { label: 'TOTAL POINTS', a: tA.total || 0, b: tB.total || 0 },
    { label: 'ELIMINATIONS', a: tA.kills || 0, b: tB.kills || 0 },
    { label: 'TOTAL DAMAGE', a: tA.damage || 0, b: tB.damage || 0 },
    { label: fourthLabel, a: fourthA, b: fourthB },
  ];

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
          onClick={(e) => onElementClick?.(e, 's1', 'p1', `${tA.name} Color`)}
        >
          {winnerSide === 'p1' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-2.5">
            <TeamLogoBadge
              tag={tA.tag}
              name={tA.name}
              logoUrl={teamLogoMap[tA.tag.toUpperCase()] || teamLogoMap[tA.name.toUpperCase()] || tA.logoUrl}
              color={themeS1.p1}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: themeS1.p1 }}
              >
                TEAM 01 {tA.rank ? `• RANK #${tA.rank}` : ''}
              </div>
              <div className="font-hud text-base sm:text-lg font-extrabold text-white leading-tight truncate max-w-[150px]">
                {tA.name}
              </div>
              <div className="text-[11px] font-bold text-slate-300">{tA.tag}</div>
            </div>
          </div>
        </div>

        {/* Contender 2 Card */}
        <div
          id="s3-card-p2"
          className="dark-box rounded-lg px-3 py-1.5 border-r-4 text-right relative transition-all duration-700 w-fit max-w-[280px] ml-auto"
          style={{ borderRightColor: themeS1.p2 }}
          onClick={(e) => onElementClick?.(e, 's1', 'p2', `${tB.name} Color`)}
        >
          {winnerSide === 'p2' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-2.5">
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: themeS1.p2 }}
              >
                TEAM 02 {tB.rank ? `• RANK #${tB.rank}` : ''}
              </div>
              <div className="font-hud text-base sm:text-lg font-extrabold text-white leading-tight truncate max-w-[150px]">
                {tB.name}
              </div>
              <div className="text-[11px] font-bold text-slate-300">{tB.tag}</div>
            </div>
            <TeamLogoBadge
              tag={tB.tag}
              name={tB.name}
              logoUrl={teamLogoMap[tB.tag.toUpperCase()] || teamLogoMap[tB.name.toUpperCase()] || tB.logoUrl}
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
              onClick={(e) => onElementClick?.(e, 's1', 'p1', `${tA.name} Color`)}
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
              onClick={(e) => onElementClick?.(e, 's1', 'p2', `${tB.name} Color`)}
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
              <div className="relative flex items-center h-14 w-full">
                {/* Left Bar (Contender 1) */}
                <div
                  className="w-1/2 h-full flex justify-end overflow-hidden cursor-pointer"
                  onClick={(e) => onElementClick?.(e, 's1', 'p1', `${tA.name} Bar Color`)}
                >
                  <div
                    className="bar-live h-full rounded-l-md flex items-center justify-start pl-6 overflow-hidden"
                    style={{
                      backgroundColor: themeS1.p1,
                      width: animated ? `${wA}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  >
                    <span className="unskew font-hud font-extrabold text-2xl sm:text-3xl text-white">
                      {formatNumber(r.a)}
                    </span>
                  </div>
                </div>

                {/* Right Bar (Contender 2) */}
                <div
                  className="w-1/2 h-full flex justify-start overflow-hidden cursor-pointer"
                  onClick={(e) => onElementClick?.(e, 's1', 'p2', `${tB.name} Bar Color`)}
                >
                  <div
                    className="bar-live h-full rounded-r-md flex items-center justify-end pr-6 overflow-hidden"
                    style={{
                      backgroundColor: themeS1.p2,
                      width: animated ? `${wB}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  >
                    <span className="unskew font-hud font-extrabold text-2xl sm:text-3xl text-slate-950">
                      {formatNumber(r.b)}
                    </span>
                  </div>
                </div>

                {/* Centered Stat Title Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="unskew px-4 py-1 rounded-md text-sm sm:text-base font-extrabold tracking-widest border shadow-lg cursor-pointer hover:scale-105 transition-transform"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
