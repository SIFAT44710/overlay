'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface WeaponMeta {
  name: string;
  kills: number;
  damage: number;
  hs: number;
  color: string;
}

const DEFAULT_WEAPONS: WeaponMeta[] = [
  { name: 'EVO3', kills: 256, damage: 115964, hs: 283, color: '#8b5cf6' },
  { name: 'M7', kills: 61, damage: 35086, hs: 79, color: '#2dd4bf' },
  { name: 'AWM', kills: 37, damage: 36446, hs: 11, color: '#fbbf24' },
  { name: 'UZI', kills: 24, damage: 11059, hs: 66, color: '#f43f5e' },
  { name: 'WOODPECKER', kills: 17, damage: 14844, hs: 29, color: '#38bdf8' },
];

export default function Dashboard4({ overrideColors }: { overrideColors?: any } = {}) {
  const [activeItems, setActiveItems] = useState<boolean[]>([false, false, false, false, false]);
  const [killsCounts, setKillsCounts] = useState<number[]>([0, 0, 0, 0, 0]);
  const [topFireActive, setTopFireActive] = useState(false);

  const { data: weaponsData } = useSWR('/api/weapons', fetcher, { refreshInterval: 2500 });

  const list: WeaponMeta[] = React.useMemo(() => {
    if (weaponsData?.weapons && weaponsData.weapons.length >= 5) {
      return weaponsData.weapons.slice(0, 5).map((w: any, idx: number) => ({
        name: w.name || DEFAULT_WEAPONS[idx].name,
        kills: parseInt(w.kills, 10) || DEFAULT_WEAPONS[idx].kills,
        damage: parseInt(w.damage, 10) || DEFAULT_WEAPONS[idx].damage,
        hs: parseInt(w.hs, 10) || DEFAULT_WEAPONS[idx].hs,
        color: DEFAULT_WEAPONS[idx].color,
      }));
    }
    return DEFAULT_WEAPONS;
  }, [weaponsData]);

  const maxK = 256;

  useEffect(() => {
    list.forEach((w, i) => {
      const delay = 160 + i * 200;
      setTimeout(() => {
        setActiveItems((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        // Tween kills count
        const start = performance.now();
        const duration = 1500;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = Math.round(w.kills * eased);
          setKillsCounts((prev) => {
            const next = [...prev];
            next[i] = val;
            return next;
          });
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        if (i === 0) {
          setTopFireActive(true);
        }
      }, delay);
    });
  }, [list]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl">
        {/* Left: Concentric Weapon Meta Rings with Free Fire Flame Logo */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[300px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
          >
            <defs>
              <linearGradient id="ffLogoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FACC15" />
                <stop offset="55%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
              <linearGradient id="ffRingStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5B700" />
                <stop offset="100%" stopColor="#EC008C" />
              </linearGradient>
            </defs>

            {/* Rings */}
            {list.map((w, i) => {
              const r = 132 - i * 22;
              const circ = 2 * Math.PI * r;
              const frac = Math.max(0.14, (w.kills / maxK) * 0.78);
              const targetOffset = circ * (1 - frac);
              const isLoaded = activeItems[i];

              return (
                <g key={w.name}>
                  {/* Track ring */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="rgba(168,85,247,0.16)"
                    strokeWidth="14"
                  />
                  {/* Glowing progress arc */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke={w.color}
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90 160 160)"
                    className="arc-sweep neon-pulse"
                    style={{
                      color: w.color,
                      animationDelay: `${(i * 0.3).toFixed(2)}s`,
                    }}
                    strokeDasharray={circ}
                    strokeDashoffset={isLoaded ? targetOffset : circ}
                  />
                </g>
              );
            })}

            {/* Center Free Fire Flame Logo */}
            <circle
              cx="160"
              cy="160"
              r="27"
              fill="rgba(59,7,100,0.32)"
              stroke="url(#ffRingStroke)"
              strokeWidth="2.6"
            />
            <circle
              cx="160"
              cy="160"
              r="22"
              fill="none"
              stroke="rgba(250,204,21,0.28)"
              strokeWidth="1"
            />
            <g transform="translate(160,160)">
              <path
                d="M-3,-16 C2,-10 7,-4 5,3 C8,0 10,-4 10,-8 C14,-2 13,8 7,13 C3,16 -4,16 -8,12 C-13,7 -12,-2 -7,-8 C-7,-4 -5,-2 -3,-1 C-6,-6 -6,-12 -3,-16 Z"
                fill="url(#ffLogoGrad)"
              />
              <path d="M-1,-11 L3,5 L-1,11 L-4,5 Z" fill="#fff7ed" opacity="0.92" />
            </g>
          </svg>
        </div>

        {/* Right: Weapon Stat Cards */}
        <div className="space-y-3">
          {list.map((w, i) => {
            const isLoaded = activeItems[i];
            const isTop1 = i === 0;
            const barWidth = Math.max(12, (w.kills / maxK) * 100);

            return (
              <div
                key={w.name}
                className={`pop-card hud-card rounded-xl p-3 relative transition-all duration-500 ${
                  isTop1 ? 'top1-hero-glow' : ''
                }`}
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? isTop1
                      ? 'translateX(0) scale(1.04)'
                      : 'translateX(0)'
                    : 'translateX(28px)',
                  isolation: 'isolate',
                }}
              >
                {/* Real-time Spirit Fire Canvas on Top 1 Weapon */}
                {isTop1 && (
                  <div
                    className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500 ${
                      topFireActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ zIndex: -1 }}
                  >
                    <RealFireCanvas opts={{ light: true }} />
                  </div>
                )}

                <div className="relative z-10 flex justify-between items-center mb-1.5">
                  <span className="font-hud text-base font-bold text-white flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: w.color }}
                    />
                    {w.name}
                  </span>
                  <span className="font-hud text-sm font-bold" style={{ color: w.color }}>
                    <span>{killsCounts[i]}</span> KILLS
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative z-10 w-full h-2.5 bg-purple-950/25 rounded-full overflow-hidden">
                  <div
                    className="bar-grow-x bar-live h-full rounded-full"
                    style={{
                      ['--bar-glow' as any]: w.color,
                      width: isLoaded ? `${barWidth}%` : '0%',
                      background: w.color,
                      boxShadow: `0 0 10px ${w.color}`,
                      transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </div>

                <div className="relative z-10 flex justify-between text-[11px] text-slate-300 mt-1 font-semibold">
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
