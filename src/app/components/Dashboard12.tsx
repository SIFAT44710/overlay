'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_WEAPONS = [
  { name: 'EVO3', kills: 256, damage: 115964, hs: 283, color: '#6225A6' },
  { name: 'M7', kills: 61, damage: 35086, hs: 79, color: '#EC008C' },
  { name: 'AWM', kills: 37, damage: 36446, hs: 11, color: '#F5B700' },
  { name: 'UZI', kills: 24, damage: 11059, hs: 66, color: '#00DF82' },
  { name: 'WOODPECKER', kills: 17, damage: 14844, hs: 29, color: '#111827' },
];

const DEFAULT_COLORS = {
  w1Color: '#6225A6',
  w2Color: '#EC008C',
  w3Color: '#F5B700',
  w4Color: '#00DF82',
  w5Color: '#111827',
};

export default function Dashboard12({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [barWidths, setBarWidths] = useState<number[]>(new Array(5).fill(0));
  const [ringOffsets, setRingOffsets] = useState<number[]>(new Array(5).fill(0));
  const [cardVisible, setCardVisible] = useState<boolean[]>(new Array(5).fill(false));
  const [killsCounts, setKillsCounts] = useState<number[]>(new Array(5).fill(0));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard12) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard12 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard12');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const activeColors = [
    colors.w1Color,
    colors.w2Color,
    colors.w3Color,
    colors.w4Color,
    colors.w5Color,
  ];

  const maxK = 256;

  useEffect(() => {
    // Initial full circ offsets
    const initialOffsets = DEFAULT_WEAPONS.map((_, i) => 2 * Math.PI * (132 - i * 22));
    setRingOffsets(initialOffsets);
    setBarWidths(new Array(5).fill(0));
    setCardVisible(new Array(5).fill(false));
    setKillsCounts(new Array(5).fill(0));

    const timers: NodeJS.Timeout[] = [];

    DEFAULT_WEAPONS.forEach((w, i) => {
      const r = 132 - i * 22;
      const circ = 2 * Math.PI * r;
      const frac = Math.max(0.16, (w.kills / maxK) * 0.78);
      const targetOffset = circ * (1 - frac);

      timers.push(
        setTimeout(() => {
          setRingOffsets((prev) => {
            const next = [...prev];
            next[i] = targetOffset;
            return next;
          });
          setCardVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          setBarWidths((prev) => {
            const next = [...prev];
            next[i] = Math.max(14, (w.kills / maxK) * 100);
            return next;
          });

          // Tween numbers
          const start = performance.now();
          const duration = 1400;
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setKillsCounts((prev) => {
              const next = [...prev];
              next[i] = Math.round(w.kills * eased);
              return next;
            });
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, 180 + i * 220)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-transparent select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-4xl">
        {/* Left: Concentric Progress Rings */}
        <div className="flex justify-center">
          <svg viewBox="0 0 320 320" className="w-full max-w-[300px] overflow-visible">
            {DEFAULT_WEAPONS.map((w, i) => {
              const r = 132 - i * 22;
              const circ = 2 * Math.PI * r;
              const col = activeColors[i];
              return (
                <g key={i}>
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="rgba(0,0,0,0.12)"
                    strokeWidth="14"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke={col}
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90 160 160)"
                    className="arc-sweep"
                    strokeDasharray={circ}
                    strokeDashoffset={ringOffsets[i]}
                  />
                </g>
              );
            })}
            <text
              x="160"
              y="166"
              textAnchor="middle"
              fill="#000000"
              fontSize="15"
              fontWeight="900"
              className="font-num tracking-wider"
            >
              META
            </text>
          </svg>
        </div>

        {/* Right: Weapon Stat Cards */}
        <div className="space-y-4">
          {DEFAULT_WEAPONS.map((w, i) => {
            const col = activeColors[i];
            const isVis = cardVisible[i];
            return (
              <div
                key={i}
                className="pop-el"
                style={{
                  opacity: isVis ? 1 : 0,
                  transform: isVis ? 'translateX(0)' : 'translateX(30px)',
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-title text-xl font-bold text-black flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-sm border-2 border-black"
                      style={{ backgroundColor: col }}
                    />
                    {w.name}
                  </span>
                  <span
                    className="font-num text-base font-extrabold"
                    style={{ color: col === '#F5B700' ? '#B45309' : col }}
                  >
                    <span>{killsCounts[i]}</span> KILLS
                  </span>
                </div>
                <div className="w-full h-3.5 bg-black/10 rounded overflow-hidden border border-black/30">
                  <div
                    className="bar-x h-full"
                    style={{ width: `${barWidths[i]}%`, backgroundColor: col }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-800 mt-1 font-bold font-num">
                  <span>DMG: {w.damage.toLocaleString()}</span>
                  <span>HEADSHOTS: {w.hs}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
