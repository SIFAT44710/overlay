'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoleStat {
  role: 'RUSHER' | 'SUPPORT' | 'SNIPER' | 'BOMBER';
  tag: string;
  players: number;
  kills: number;
  damage: number;
  top: string;
  color: string;
  bgTint: string;
  borderTint: string;
}

const DEFAULT_ROLES: RoleStat[] = [
  {
    role: 'RUSHER',
    tag: 'ASSAULT FRONTLINE',
    players: 26,
    kills: 269,
    damage: 156973,
    top: 'TOP.1SHOVO (29K)',
    color: '#EF4444',
    bgTint: 'rgba(239, 68, 68, 0.16)',
    borderTint: 'rgba(239, 68, 68, 0.65)',
  },
  {
    role: 'SUPPORT',
    tag: 'TACTICAL MEDIC',
    players: 13,
    kills: 134,
    damage: 80695,
    top: 'S9X.JACK007 (21K)',
    color: '#22C55E',
    bgTint: 'rgba(34, 197, 94, 0.16)',
    borderTint: 'rgba(34, 197, 94, 0.65)',
  },
  {
    role: 'SNIPER',
    tag: 'LONG-RANGE MARKSMAN',
    players: 8,
    kills: 83,
    damage: 73400,
    top: 'S9X.KARAKEN (17K)',
    color: '#A855F7',
    bgTint: 'rgba(168, 85, 247, 0.16)',
    borderTint: 'rgba(168, 85, 247, 0.65)',
  },
  {
    role: 'BOMBER',
    tag: 'GRENADIER BLAST',
    players: 6,
    kills: 70,
    damage: 39268,
    top: 'CME.YAKUZA (19K)',
    color: '#FACC15',
    bgTint: 'rgba(250, 204, 21, 0.16)',
    borderTint: 'rgba(250, 204, 21, 0.65)',
  },
];

function RoleIcon({ role }: { role: string }) {
  switch (role) {
    case 'RUSHER':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case 'SUPPORT':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 2l7 3.5v6c0 5-3.2 8.8-7 10.5-3.8-1.7-7-5.5-7-10.5v-6L12 2z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          <path d="M12 8v6M9 11h6" />
        </svg>
      );
    case 'SNIPER':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="7" fill="currentColor" fillOpacity="0.18" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case 'BOMBER':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="14" r="6.5" fill="currentColor" fillOpacity="0.25" />
          <path d="M15.5 8.5l2.5-2.5M18 3v2M21 6h-2M19.5 8.5l1.5 1.5M9 12.5l4 3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Dashboard5({ overrideColors }: { overrideColors?: any } = {}) {
  const [activeItems, setActiveItems] = useState<boolean[]>([false, false, false, false]);
  const [totalKillsDisp, setTotalKillsDisp] = useState(0);
  const [topFireActive, setTopFireActive] = useState(false);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });
  const roles: RoleStat[] = (sheetData?.roles && sheetData.roles.length > 0)
    ? sheetData.roles
    : DEFAULT_ROLES;
  const tot = roles.reduce((s, r) => s + r.kills, 0);

  const R = 108;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    // Tween center total (1800ms)
    const start = performance.now();
    const duration = 1800;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setTotalKillsDisp(Math.round(tot * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    // Sequential segment & card reveal (200 + i * 240ms)
    roles.forEach((_, i) => {
      const delay = 200 + i * 240;
      setTimeout(() => {
        setActiveItems((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        if (i === 0) {
          setTopFireActive(true);
        }
      }, delay);
    });
  }, [tot, roles]);

  let cumulativeKills = 0;

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
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
              stroke="rgba(168,85,247,0.16)"
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
                  className="arc-sweep neon-pulse"
                  style={{
                    color: r.color,
                    animationDelay: `${(i * 0.35).toFixed(2)}s`,
                  }}
                  strokeDasharray={CIRC}
                  strokeDashoffset={isLoaded ? targetOffset : CIRC}
                />
              );
            })}
          </svg>

          {/* Center Role Kills Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-xl bg-transparent text-center">
              <div className="font-hud text-3xl font-bold text-white leading-none">
                {totalKillsDisp}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mt-1">
                ROLE KILLS
              </div>
            </div>
          </div>
        </div>

        {/* Right: 4 Role Stat Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r, i) => {
            const isLoaded = activeItems[i];
            const isTop1 = i === 0;

            return (
              <div
                key={r.role}
                className={`pop-card hud-card rounded-xl p-3.5 relative overflow-hidden transition-all duration-500 ${
                  isTop1 ? 'top1-hero-glow' : ''
                }`}
                style={{
                  borderColor: r.borderTint,
                  background: `linear-gradient(145deg, ${r.bgTint}, transparent)`,
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? (isTop1 ? 'scale(1.05)' : 'scale(1)') : 'scale(0.9)',
                  isolation: 'isolate',
                }}
              >
                {/* Real-time Spirit Fire Canvas on Top 1 Role */}
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

                {/* Top Colored Glow Line */}
                <div
                  className="absolute top-0 inset-x-0 h-1"
                  style={{
                    background: r.color,
                    boxShadow: `0 0 12px ${r.color}`,
                  }}
                />

                <div className="relative z-10 flex justify-between items-center mt-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: r.bgTint,
                        color: r.color,
                        border: `1px solid ${r.borderTint}`,
                        boxShadow: `0 0 10px ${r.bgTint}`,
                      }}
                    >
                      <RoleIcon role={r.role} />
                    </span>
                    <div>
                      <div
                        className="font-hud text-base font-extrabold leading-tight"
                        style={{ color: r.color }}
                      >
                        {r.role}
                      </div>
                      <div className="text-[9px] font-bold tracking-wider text-slate-400">
                        {r.tag}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-transparent border border-white/25 text-slate-100">
                    {r.players} PLR
                  </span>
                </div>

                <div className="relative z-10 font-hud text-2xl font-bold text-white mt-2">
                  {r.kills} <span className="text-xs text-slate-300 font-normal">KILLS</span>
                </div>
                <div className="relative z-10 text-[11px] text-slate-300 mt-0.5 font-medium">
                  DMG: {r.damage.toLocaleString()}
                </div>
                <div className="relative z-10 mt-2 pt-1.5 border-t border-white/10 text-[11px] font-bold text-amber-300">
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
