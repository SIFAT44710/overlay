'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoleStat {
  role: string;
  players: number;
  kills: number;
  damage: number;
  top: string;
  color: string;
}

const DEFAULT_ROLES: RoleStat[] = [
  { role: 'RUSHER',  players: 26, kills: 269, damage: 156973, top: 'TOP.1SHOVO (29K)',  color: '#8b5cf6' },
  { role: 'SUPPORT', players: 13, kills: 134, damage: 80695,  top: 'S9X.JACK007 (21K)', color: '#2dd4bf' },
  { role: 'SNIPER',  players: 8,  kills: 83,  damage: 73400,  top: 'S9X.KARAKEN (17K)', color: '#fbbf24' },
  { role: 'BOMBER',  players: 6,  kills: 70,  damage: 39268,  top: 'CME.YAKUZA (19K)',  color: '#f43f5e' },
];

export default function Dashboard5({ overrideColors }: { overrideColors?: any } = {}) {
  const [activeItems, setActiveItems] = useState<boolean[]>([false, false, false, false]);
  const [totalKillsDisp, setTotalKillsDisp] = useState(0);

  const roles = DEFAULT_ROLES;
  const tot = roles.reduce((s, r) => s + r.kills, 0);

  const R = 108;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    // Tween center total
    const start = performance.now();
    const duration = 1800;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setTotalKillsDisp(Math.round(tot * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    // Sequential segment & card reveal
    roles.forEach((_, i) => {
      const delay = 200 + i * 240;
      setTimeout(() => {
        setActiveItems((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay);
    });
  }, [tot, roles]);

  let cumulativeKills = 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl">
        {/* Left: Donut SVG with animated role segments */}
        <div className="relative flex justify-center items-center">
          <svg
            viewBox="0 0 300 300"
            className="w-full max-w-[280px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
          >
            {/* Background track */}
            <circle
              cx="150"
              cy="150"
              r={R}
              fill="none"
              stroke="#090b10"
              strokeWidth="38"
            />

            {/* Segment arcs */}
            {roles.map((r, i) => {
              const segLen = CIRC * (r.kills / tot);
              const rot = (cumulativeKills / tot) * 360 - 90;
              cumulativeKills += r.kills;
              const targetOffset = CIRC - segLen + 4;
              const isLoaded = activeItems[i];

              return (
                <circle
                  key={r.role}
                  cx="150"
                  cy="150"
                  r={R}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="32"
                  transform={`rotate(${rot.toFixed(1)} 150 150)`}
                  className="arc-sweep"
                  strokeDasharray={CIRC}
                  strokeDashoffset={isLoaded ? targetOffset : CIRC}
                />
              );
            })}
          </svg>

          {/* Center Role Kills Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-slate-950/95 border border-white/15 text-center shadow-lg">
              <div className="font-hud text-3xl font-bold text-white leading-none">
                {totalKillsDisp}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300 mt-1">
                ROLE KILLS
              </div>
            </div>
          </div>
        </div>

        {/* Right: 4 Role Stat Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r, i) => {
            const isLoaded = activeItems[i];
            return (
              <div
                key={r.role}
                className="pop-card hud-card rounded-xl p-3.5 shadow-lg"
                style={{
                  borderColor: r.color,
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'scale(1)' : 'scale(0.9)',
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-hud text-base font-bold" style={{ color: r.color }}>
                    {r.role}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/5 font-hud">
                    {r.players} PLR
                  </span>
                </div>
                <div className="font-hud text-2xl font-bold text-white mt-1">
                  {r.kills} <span className="text-xs text-slate-400 font-normal">KILLS</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-hud font-semibold">
                  DMG: {r.damage.toLocaleString()}
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] font-bold text-amber-300 font-hud">
                  ★ {r.top}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
