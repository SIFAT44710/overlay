'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_WEAPONS = [
  { name: 'EVO3', kills: 256, damage: 115964, hs: 283, color: '#8b5cf6' },
  { name: 'M7', kills: 61, damage: 35086, hs: 79, color: '#2dd4bf' },
  { name: 'AWM', kills: 37, damage: 36446, hs: 11, color: '#fbbf24' },
  { name: 'UZI', kills: 24, damage: 11059, hs: 66, color: '#f43f5e' },
  { name: 'WOODPECKER', kills: 17, damage: 14844, hs: 29, color: '#38bdf8' },
];

const DEFAULT_COLORS = {
  w1Color: '#8b5cf6',
  w2Color: '#2dd4bf',
  w3Color: '#fbbf24',
  w4Color: '#f43f5e',
  w5Color: '#38bdf8',
  fireColor: '#8b5cf6',
};

export default function Dashboard4({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [ringOffsets, setRingOffsets] = useState<number[]>(new Array(5).fill(0));
  const [barWidths, setBarWidths] = useState<number[]>(new Array(5).fill(0));
  const [cardVisible, setCardVisible] = useState<boolean[]>(new Array(5).fill(false));
  const [killsCounts, setKillsCounts] = useState<number[]>(new Array(5).fill(0));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: weaponsData } = useSWR('/api/weapons', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard4) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard4 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard4');
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

  const weapons = React.useMemo(() => {
    if (weaponsData?.success && weaponsData.weapons && weaponsData.weapons.length > 0) {
      return weaponsData.weapons.slice(0, 5).map((w: any, idx: number) => ({
        ...w,
        color: activeColors[idx] || w.color,
      }));
    }
    return DEFAULT_WEAPONS.map((w, idx) => ({ ...w, color: activeColors[idx] }));
  }, [weaponsData, activeColors]);

  const maxK = Math.max(100, ...weapons.map((w: any) => w.kills));

  useEffect(() => {
    const initialOffsets = weapons.map((_: any, i: number) => 2 * Math.PI * (132 - i * 22));
    setRingOffsets(initialOffsets);
    setBarWidths(new Array(5).fill(0));
    setCardVisible(new Array(5).fill(false));
    setKillsCounts(new Array(5).fill(0));

    const timers: NodeJS.Timeout[] = [];

    weapons.forEach((w: any, i: number) => {
      const r = 132 - i * 22;
      const circ = 2 * Math.PI * r;
      const frac = Math.max(0.14, (w.kills / maxK) * 0.78);
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
            next[i] = Math.max(12, (w.kills / maxK) * 100);
            return next;
          });

          // Tween numbers
          const start = performance.now();
          const duration = 1500;
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
        }, 160 + i * 200)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [weapons, maxK]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-10 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.w1Color} height={130} opacity={0.65} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl relative z-10">
        {/* Left: Concentric Progress Rings */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[300px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] overflow-visible"
          >
            {weapons.map((w: any, i: number) => {
              const r = 132 - i * 22;
              const circ = 2 * Math.PI * r;
              return (
                <g key={w.name}>
                  {/* Track */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.7)"
                    strokeWidth="14"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke={w.color}
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90 160 160)"
                    className="arc-sweep"
                    strokeDasharray={circ}
                    strokeDashoffset={ringOffsets[i] || circ}
                  />
                </g>
              );
            })}
            <circle
              cx="160"
              cy="160"
              r="24"
              fill="#090b10"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
            <text
              x="160"
              y="164"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="800"
              className="font-hud"
            >
              META
            </text>
          </svg>
        </div>

        {/* Right: Weapon Stat Cards */}
        <div className="space-y-3">
          {weapons.map((w: any, i: number) => (
            <div
              key={w.name}
              className="pop-card hud-card rounded-xl p-3"
              style={{
                opacity: cardVisible[i] ? 1 : 0,
                transform: cardVisible[i] ? 'translateX(0)' : 'translateX(28px)',
              }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-hud text-base font-bold text-white flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: w.color }}
                  />
                  {w.name}
                </span>
                <span
                  className="font-hud text-sm font-bold"
                  style={{ color: w.color }}
                >
                  {killsCounts[i]} KILLS
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="bar-grow-x h-full rounded-full"
                  style={{
                    width: `${barWidths[i]}%`,
                    background: w.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 mt-1 font-semibold">
                <span>DMG: {w.damage.toLocaleString()}</span>
                <span>HEADSHOTS: {w.hs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
