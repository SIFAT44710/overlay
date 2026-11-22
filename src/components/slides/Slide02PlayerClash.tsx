'use client';

import React, { useEffect, useState } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide02PlayerClash({ sheetData, theme, onElementClick }: SlideProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const themeS1 = theme?.s1 || { p1: '#8b5cf6', p2: '#2dd4bf', accent: '#fbbf24' };
  const custom = theme?.custom;
  const source = theme?.sources?.[1] || 'day_top2_duel';

  // Determine contender 1 and contender 2 based on selected source / custom pickers
  let p1 = sheetData?.duel1v1?.p1 || {
    name: 'TOP.1SHOVO',
    team: 'RAAD VAI YT',
    tag: 'TOP',
    kills: 29,
    damage: 11859,
    hs: 31,
    assist: 22,
  };
  let p2 = sheetData?.duel1v1?.p2 || {
    name: 'EXE.SEJAN',
    team: 'EXTREME EX',
    tag: 'EXE',
    kills: 27,
    damage: 11890,
    hs: 22,
    assist: 13,
  };

  if (source === 'custom_duel' && sheetData?.dayTop10Players?.length) {
    const a = sheetData.dayTop10Players[custom?.p1Idx ?? 0] || sheetData.dayTop10Players[0];
    const b = sheetData.dayTop10Players[custom?.p2Idx ?? 1] || sheetData.dayTop10Players[1];
    p1 = { name: a.name, team: a.team, tag: a.tag, kills: a.kills, damage: a.dmg, hs: a.hs, assist: a.assist };
    p2 = { name: b.name, team: b.team, tag: b.tag, kills: b.kills, damage: b.dmg, hs: b.hs, assist: b.assist };
  }

  const s1 = p1.kills * 100 + p1.damage * 0.1 + p1.hs * 40;
  const s2 = p2.kills * 100 + p2.damage * 0.1 + p2.hs * 40;
  const pct1 = Math.round((s1 / (s1 + s2 || 1)) * 100);
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

  return (
    <div className="w-full max-w-[1340px] space-y-5 font-hud">
      {/* Top Contender Header Plates */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4 w-full">
        {/* Contender 1 Card */}
        <div
          id="s3-card-p1"
          className="dark-box rounded-xl px-4 py-2.5 border-l-4 text-left relative transition-all duration-700 w-fit max-w-[340px]"
          style={{ borderLeftColor: themeS1.p1 }}
          onClick={(e) => onElementClick?.(e, 's1', 'p1', 'Contender 1 Color')}
        >
          {winnerSide === 'p1' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-3.5">
            <TeamLogoBadge
              tag={p1.tag}
              name={p1.team}
              color={themeS1.p1}
              sizeCls="w-16 h-16"
            />
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: themeS1.p1 }}
              >
                CONTENDER 01
              </div>
              <div className="font-hud text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {p1.name}
              </div>
              <div className="text-xs font-bold text-slate-300">{p1.team}</div>
            </div>
          </div>
        </div>

        {/* Contender 2 Card */}
        <div
          id="s3-card-p2"
          className="dark-box rounded-xl px-4 py-2.5 border-r-4 text-right relative transition-all duration-700 w-fit max-w-[340px] ml-auto"
          style={{ borderRightColor: themeS1.p2 }}
          onClick={(e) => onElementClick?.(e, 's1', 'p2', 'Contender 2 Color')}
        >
          {winnerSide === 'p2' && <SpiritFireCanvas />}
          <div className="relative z-10 flex items-center gap-3.5">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: themeS1.p2 }}
              >
                CONTENDER 02
              </div>
              <div className="font-hud text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {p2.name}
              </div>
              <div className="text-xs font-bold text-slate-300">{p2.team}</div>
            </div>
            <TeamLogoBadge
              tag={p2.tag}
              name={p2.team}
              color={themeS1.p2}
              sizeCls="w-16 h-16"
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
              strokeDashoffset: mounted ? ARC * (1 - pct1 / 100) : ARC,
              transition: 'stroke-dashoffset 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
            }}
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
              strokeDashoffset: mounted ? ARC * (1 - pct2 / 100) : ARC,
              transition: 'stroke-dashoffset 1.85s cubic-bezier(0.22, 1.08, 0.36, 1)',
            }}
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
            className={mounted ? 'scanner-run' : ''}
          />

          {/* Shockwave Burst */}
          <circle
            cx={px.toFixed(1)}
            cy={py.toFixed(1)}
            r="6"
            fill="none"
            stroke="#000000"
            className={mounted ? 'shock-run' : ''}
          />

          {/* Spark Indicator */}
          <circle
            cx={mounted ? px.toFixed(1) : '55'}
            cy={mounted ? py.toFixed(1) : '170'}
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
          <div className="px-6 py-1.5 rounded-xl bg-slate-950/95 border border-purple-400/50 font-hud text-3xl sm:text-4xl font-extrabold text-white shadow-2xl">
            <span style={{ color: themeS1.p1 }}>{mounted ? `${pct1}%` : '0%'}</span>
            <span className="text-amber-400 text-base mx-2">VS</span>
            <span style={{ color: themeS1.p2 }}>{mounted ? `${pct2}%` : '0%'}</span>
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
                opacity: mounted ? 1 : 0,
                transform: mounted
                  ? 'skewX(-10deg) translateY(0) scaleX(1)'
                  : 'skewX(-10deg) translateY(24px) scaleX(0.32)',
                transition: `opacity 0.5s ease ${idx * 0.15}s, transform 0.65s cubic-bezier(0.22, 1.12, 0.36, 1) ${idx * 0.15}s`,
              }}
            >
              <div className="relative flex items-center h-14 w-full">
                {/* Left Bar (Contender 1) */}
                <div className="w-1/2 h-full flex justify-end overflow-hidden">
                  <div
                    className="bar-live h-full rounded-l-md flex items-center justify-start pl-6 overflow-hidden"
                    style={{
                      backgroundColor: themeS1.p1,
                      width: mounted ? `${wA}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  >
                    <span className="unskew font-hud font-extrabold text-2xl sm:text-3xl text-white">
                      {formatNumber(r.a)}
                    </span>
                  </div>
                </div>

                {/* Right Bar (Contender 2) */}
                <div className="w-1/2 h-full flex justify-start overflow-hidden">
                  <div
                    className="bar-live h-full rounded-r-md flex items-center justify-end pr-6 overflow-hidden"
                    style={{
                      backgroundColor: themeS1.p2,
                      width: mounted ? `${wB}%` : '0%',
                      transition: 'width 1.65s cubic-bezier(0.22, 1, 0.36, 1) 0.3s',
                    }}
                  >
                    <span className="unskew font-hud font-extrabold text-2xl sm:text-3xl text-slate-950">
                      {formatNumber(r.b)}
                    </span>
                  </div>
                </div>

                {/* Center Badge Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="unskew px-4 py-1 rounded-md text-sm sm:text-base font-extrabold tracking-widest border shadow-lg"
                    style={{
                      color: themeS1.accent,
                      borderColor: themeS1.accent,
                      backgroundColor: 'var(--ui-box-bg, #0a0c16)',
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
  );
}
