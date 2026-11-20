'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

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

  const { data: weaponsData } = useSWR('/api/weapons', fetcher, { refreshInterval: 3000 });

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
      }, delay);
    });
  }, [list]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl">
        {/* Left: Concentric Weapon Meta Rings */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[300px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
          >
            {list.map((w, i) => {
              const r = 132 - i * 22;
              const circ = 2 * Math.PI * r;
              const frac = Math.max(0.14, (w.kills / maxK) * 0.78);
              const targetOffset = circ * (1 - frac);
              const isLoaded = activeItems[i];

              return (
                <g key={w.name}>
                  {/* Outer track */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="rgba(15,23,42,0.7)"
                    strokeWidth="14"
                  />
                  {/* Progress arc */}
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
                    strokeDashoffset={isLoaded ? targetOffset : circ}
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
              fill="#fff"
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
          {list.map((w, i) => {
            const isLoaded = activeItems[i];
            const barWidth = Math.max(12, (w.kills / maxK) * 100);

            return (
              <div
                key={w.name}
                className="pop-card hud-card rounded-xl p-3 shadow-lg"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateX(0)' : 'translateX(28px)',
                }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-hud text-base font-bold text-white flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: w.color }}
                    />
                    {w.name}
                  </span>
                  <span className="font-hud text-sm font-bold" style={{ color: w.color }}>
                    <span>{killsCounts[i]}</span> KILLS
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="bar-grow-x h-full rounded-full"
                    style={{
                      width: isLoaded ? `${barWidth}%` : '0%',
                      background: w.color,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-300 mt-1 font-semibold font-hud">
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
