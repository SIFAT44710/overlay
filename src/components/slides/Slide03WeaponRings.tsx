'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide03WeaponRings({
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
      }, 120);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(rafId);
  }, [replayKey]);

  const weapons =
    sheetData?.weaponsDay && sheetData.weaponsDay.length > 0
      ? sheetData.weaponsDay
      : [
          { name: 'EVO3', kills: 256, damage: 115964, hs: 283, color: '#8b5cf6' },
          { name: 'M7', kills: 61, damage: 35086, hs: 79, color: '#2dd4bf' },
          { name: 'AWM', kills: 37, damage: 36446, hs: 11, color: '#fbbf24' },
          { name: 'UZI', kills: 24, damage: 11059, hs: 66, color: '#f43f5e' },
          { name: 'WOODPECKER', kills: 17, damage: 14844, hs: 29, color: '#38bdf8' },
        ];

  const themeS2 = theme?.s2 || {
    w0: '#8b5cf6',
    w1: '#2dd4bf',
    w2: '#fbbf24',
    w3: '#f43f5e',
    w4: '#38bdf8',
  };
  const maxK = Math.max(...weapons.map((w) => w.kills), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-[1340px] font-hud select-none">
      {/* Concentric Target Rings with Centered Crown Emblem */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 320 320"
          className="w-full max-w-[480px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)] overflow-visible"
        >
          {weapons.map((w, i) => {
            const r = 132 - i * 22;
            const circ = 2 * Math.PI * r;
            const frac = Math.max(0.14, (w.kills / maxK) * 0.78);
            const colKey = `w${i}` as keyof typeof themeS2;
            const col = (themeS2 as any)[colKey] || w.color;
            const targetOffset = circ * (1 - frac);

            return (
              <g key={w.name}>
                {/* Background Ring Track */}
                <circle
                  cx="160"
                  cy="160"
                  r={r}
                  fill="none"
                  stroke="rgba(168,85,247,0.16)"
                  strokeWidth="14"
                />
                {/* Active Glowing Laser Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r={r}
                  fill="none"
                  stroke={col}
                  strokeWidth="14"
                  strokeLinecap="round"
                  transform="rotate(-90 160 160)"
                  className="arc-sweep neon-pulse"
                  style={{
                    color: col,
                    strokeDasharray: circ,
                    strokeDashoffset: animated ? targetOffset : circ,
                    transition: `stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1) ${i * 0.15}s`,
                    animationDelay: `${(i * 0.3).toFixed(2)}s`,
                  }}
                  data-edit-group="s2"
                  data-edit-key={colKey}
                  onClick={(e) => onElementClick?.(e, 's2', colKey, `${w.name} Ring`)}
                />
              </g>
            );
          })}

          {/* Centered Gold/Magenta Crown Emblem */}
          <circle cx="160" cy="160" r="28" fill="#0b0f1d" stroke="#F5B700" strokeWidth="2.8" />
          <g transform="translate(160,160)">
            <polygon points="-13,7 -16,-7 -7,-1 0,-11 7,-1 16,-7 13,7" fill="#F5B700" />
            <rect x="-13" y="9" width="26" height="3.5" rx="1.5" fill="#EC008C" />
          </g>
        </svg>
      </div>

      {/* Right-Side Weapon Metric Cards with Full Numbers (Zero 'K') */}
      <div className="space-y-3">
        {weapons.map((w, i) => {
          const colKey = `w${i}` as keyof typeof themeS2;
          const col = (themeS2 as any)[colKey] || w.color;
          const barW = Math.max(12, Math.round((w.kills / maxK) * 100));
          const isTopWeapon = i === 0;

          return (
            <div
              key={w.name}
              className={`pop-card hud-card rounded-xl p-4 transition-all relative cursor-pointer hover:border-purple-400/80 ${
                isTopWeapon ? 'top1-hero-glow' : ''
              }`}
              style={{
                opacity: animated ? 1 : 0,
                transform: animated
                  ? isTopWeapon
                    ? 'translateX(0) scale(1.03)'
                    : 'translateX(0)'
                  : 'translateX(28px)',
                transition: `transform 0.85s cubic-bezier(0.22, 1.15, 0.36, 1) ${i * 0.12}s, opacity 0.65s ease ${i * 0.12}s`,
              }}
              onClick={(e) => onElementClick?.(e, 's2', colKey, `${w.name} Color`)}
              title={`Click to change ${w.name} ring and bar color`}
            >
              {isTopWeapon && <SpiritFireCanvas />}
              <div className="flex justify-between items-center mb-1.5 relative z-10">
                <span className="font-hud text-xl font-bold text-white flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: col }}
                  />
                  {w.name}
                </span>
                <span className="font-hud text-xl font-extrabold" style={{ color: col }}>
                  {formatNumber(w.kills)} KILLS
                </span>
              </div>

              {/* Glowing Bar */}
              <div className="w-full h-4 bg-purple-950/30 rounded-full overflow-hidden relative z-10">
                <div
                  className="bar-grow-x bar-live h-full rounded-full"
                  style={{
                    backgroundColor: col,
                    width: animated ? `${barW}%` : '0%',
                    transition: `width 1.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + i * 0.12}s`,
                  }}
                />
              </div>

              {/* Full Damage & Headshot Exact Numbers */}
              <div className="flex justify-between text-base text-slate-200 mt-1.5 font-extrabold relative z-10">
                <span>DMG: {formatNumber(w.damage)}</span>
                <span>HEADSHOTS: {formatNumber(w.hs)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
