'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoleItem {
  role: string;
  players: number;
  kills: number;
  damage: number;
  top: string;
  color: string;
}

const DEFAULT_ROLES: RoleItem[] = [
  { role: 'RUSHER', players: 26, kills: 269, damage: 156973, top: 'TOP.1SHOVO (29K)', color: '#8b5cf6' },
  { role: 'SUPPORT', players: 13, kills: 134, damage: 80695, top: 'S9X.JACK007 (21K)', color: '#2dd4bf' },
  { role: 'SNIPER', players: 8, kills: 83, damage: 73400, top: 'S9X.KARAKEN (17K)', color: '#fbbf24' },
  { role: 'BOMBER', players: 6, kills: 70, damage: 39268, top: 'CME.YAKUZA (19K)', color: '#f43f5e' },
];

const DEFAULT_COLORS = {
  r1Color: '#8b5cf6',
  r2Color: '#2dd4bf',
  r3Color: '#fbbf24',
  r4Color: '#f43f5e',
  fireColor: '#8b5cf6',
};

export default function Dashboard5({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [totalKills, setTotalKills] = useState(0);
  const [offsets, setOffsets] = useState<number[]>([1000, 1000, 1000, 1000]);
  const [cardsVisible, setCardsVisible] = useState<boolean[]>([false, false, false, false]);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard5) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard5 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard5');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const roles: RoleItem[] = React.useMemo(() => [
    { ...DEFAULT_ROLES[0], color: colors.r1Color },
    { ...DEFAULT_ROLES[1], color: colors.r2Color },
    { ...DEFAULT_ROLES[2], color: colors.r3Color },
    { ...DEFAULT_ROLES[3], color: colors.r4Color },
  ], [colors]);

  const tot = roles.reduce((s, r) => s + r.kills, 0);
  const R = 108;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    setOffsets([CIRC, CIRC, CIRC, CIRC]);
    setCardsVisible([false, false, false, false]);

    // Tween Total
    const start = performance.now();
    const duration = 1800;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setTotalKills(Math.round(tot * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    let off = 0;
    const targets = roles.map((r) => {
      const segLen = CIRC * (r.kills / tot);
      const target = CIRC - segLen + 4;
      off += r.kills;
      return target;
    });

    const timers: NodeJS.Timeout[] = [];
    roles.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setOffsets((prev) => {
            const next = [...prev];
            next[i] = targets[i];
            return next;
          });
          setCardsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 200 + i * 240)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [roles, tot, CIRC]);

  let runningOffset = 0;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-10 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.r1Color} height={130} opacity={0.65} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-4xl relative z-10">
        {/* Left: Donut Chart with Center Total Kills */}
        <div className="relative flex justify-center items-center">
          <svg
            viewBox="0 0 300 300"
            className="w-full max-w-[280px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] overflow-visible"
          >
            {/* Dark Track */}
            <circle
              cx="150"
              cy="150"
              r={R}
              fill="none"
              stroke="#090b10"
              strokeWidth="38"
            />

            {/* Role Segments */}
            {roles.map((r, i) => {
              const rot = (runningOffset / tot) * 360 - 90;
              runningOffset += r.kills;
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
                  strokeDashoffset={offsets[i] || CIRC}
                />
              );
            })}
          </svg>

          {/* Center Role Kills Counter */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-slate-950/95 border border-white/15 text-center shadow-lg">
              <div className="font-hud text-3xl font-bold text-white leading-none">
                {totalKills}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300 mt-1">
                ROLE KILLS
              </div>
            </div>
          </div>
        </div>

        {/* Right: 4 Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r, i) => (
            <div
              key={r.role}
              className="pop-card hud-card rounded-xl p-3.5"
              style={{
                borderColor: r.color,
                opacity: cardsVisible[i] ? 1 : 0,
                transform: cardsVisible[i] ? 'scale(1)' : 'scale(0.9)',
              }}
            >
              <div className="flex justify-between items-center">
                <span
                  className="font-hud text-base font-bold"
                  style={{ color: r.color }}
                >
                  {r.role}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                  {r.players} PLR
                </span>
              </div>
              <div className="font-hud text-2xl font-bold text-white mt-1">
                {r.kills}{' '}
                <span className="text-xs text-slate-400 font-semibold">KILLS</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                DMG: {r.damage.toLocaleString()}
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] font-bold text-amber-300 truncate">
                ★ {r.top}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
