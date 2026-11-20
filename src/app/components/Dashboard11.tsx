'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ColumnTeam {
  rank: number;
  tag: string;
  name: string;
  pts: number;
  col: string;
  logoUrl?: string | null;
}

const DEFAULT_TEAMS: ColumnTeam[] = [
  { rank: 1,  tag: 'TOP', name: 'RAAD VAI YT',       pts: 134, col: '#F5B700' },
  { rank: 2,  tag: 'EXE', name: 'EXTREME EX',        pts: 98,  col: '#E11D48' },
  { rank: 3,  tag: 'S9x', name: 'SNEAKY9X',          pts: 96,  col: '#8B5CF6' },
  { rank: 4,  tag: 'CME', name: 'COFFIN MAKERS ESP', pts: 93,  col: '#2DD4BF' },
  { rank: 5,  tag: 'TRX', name: 'TITANOVA REX',      pts: 85,  col: '#38BDF8' },
  { rank: 6,  tag: 'UEO', name: 'TEAM UNIONIZED',    pts: 78,  col: '#6366F1' },
  { rank: 7,  tag: 'NK',  name: 'NOVA KNIGHT',       pts: 69,  col: '#A78BFA' },
  { rank: 8,  tag: '69',  name: '69 ESPORTS',        pts: 61,  col: '#F43F5E' },
  { rank: 9,  tag: 'JG',  name: 'JUMA GAMING',       pts: 58,  col: '#14B8A6' },
  { rank: 10, tag: 'ITZ', name: 'ITZ KABBO',         pts: 36,  col: '#60A5FA' },
  { rank: 11, tag: 'EGL', name: 'TEAM EAGLE',        pts: 33,  col: '#94A3B8' },
  { rank: 12, tag: 'SG',  name: 'SADIA GAMING',      pts: 0,   col: '#64748B' },
];

export default function Dashboard11({ overrideColors }: { overrideColors?: any } = {}) {
  const [animatedBars, setAnimatedBars] = useState<boolean[]>(new Array(12).fill(false));
  const [fireActive, setFireActive] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const teams: ColumnTeam[] = React.useMemo(() => {
    const source = dayData?.standing || sheetData?.data || [];
    if (source.length >= 6) {
      return source.slice(0, 12).map((row: any, idx: number) => {
        const pts = parseInt(row.total ?? row.Total ?? row.pts ?? 0, 10);
        const tag = row.tag || (row.TeamName ? row.TeamName.slice(0, 3).toUpperCase() : DEFAULT_TEAMS[idx]?.tag || `T${idx+1}`);
        const name = row.name || row.TeamName || DEFAULT_TEAMS[idx]?.name || tag;
        const col = DEFAULT_TEAMS[idx]?.col || '#8B5CF6';
        return {
          rank: idx + 1,
          tag,
          name,
          pts,
          col,
          logoUrl: row.logoUrl || row.LogoUrl || null,
        };
      });
    }
    return DEFAULT_TEAMS;
  }, [dayData, sheetData]);

  const maxPts = Math.max(140, ...teams.map((t) => t.pts));
  const topTeam = teams[0] || DEFAULT_TEAMS[0];

  useEffect(() => {
    setAnimatedBars(new Array(teams.length).fill(false));
    setFireActive(false);

    // Bounce reveal columns
    teams.forEach((_, i) => {
      setTimeout(() => {
        setAnimatedBars((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 100 + i * 110);
    });

    const tFire = setTimeout(() => {
      setFireActive(true);
    }, 320);

    return () => clearTimeout(tFire);
  }, [teams]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-4">
        {/* Top 1 Pill */}
        <div className="flex justify-center">
          <div
            className={`transition-all duration-500 px-4 py-1.5 rounded-xl bg-transparent border border-purple-400 font-hud text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 relative ${
              fireActive ? 'top1-hero-glow top1-scale opacity-100' : 'opacity-0'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {fireActive && (
              <div
                className="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 opacity-100"
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10 text-amber-400">#1 TOP POINTS</span>
            <span className="relative z-10">{topTeam.name} ({topTeam.tag})</span>
            <span className="relative z-10 px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold shadow">
              {topTeam.pts} PTS
            </span>
          </div>
        </div>

        {/* 12 Vertical Columns Bar Graph */}
        <div className="hud-card rounded-2xl p-4 sm:p-6 relative">
          <div className="h-72 sm:h-80 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-2 pt-8 pb-8 border-b border-slate-700/60 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-2 top-8 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-b border-dashed border-slate-400" />
              <div className="w-full border-b border-dashed border-slate-400" />
              <div className="w-full border-b border-dashed border-slate-400" />
              <div className="w-full border-b border-dashed border-slate-400" />
            </div>

            {teams.map((t, i) => {
              const isLoaded = animatedBars[i];
              const isTop1 = i === 0;
              const heightPct = Math.min(100, Math.max(4, (t.pts / maxPts) * 100));

              return (
                <div
                  key={t.tag}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Point number on top */}
                  <span
                    className={`font-hud font-bold text-[10px] sm:text-xs mb-1 transition-opacity duration-500 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isTop1 ? 'text-amber-300 font-extrabold text-xs sm:text-sm' : 'text-slate-200'}`}
                  >
                    {t.pts}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[42px] h-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg bar-live transition-all ${
                        isTop1 ? 'shadow-[0_0_14px_rgba(245,183,0,0.7)]' : ''
                      }`}
                      style={{
                        height: isLoaded ? `${heightPct}%` : '0%',
                        backgroundColor: t.col,
                        ['--bar-glow' as any]: t.col,
                        transition: 'height 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    />
                  </div>

                  {/* Bottom Tag Label */}
                  <div className="absolute -bottom-7 flex flex-col items-center">
                    <span
                      className={`font-hud font-extrabold text-[10px] sm:text-xs tracking-wider ${
                        isTop1 ? 'text-amber-400 font-black' : 'text-slate-300'
                      }`}
                    >
                      {t.tag}
                    </span>
                  </div>

                  {/* Hover Tooltip */}
                  {hoveredIdx === i && (
                    <div className="absolute -top-12 z-30 px-2.5 py-1 rounded bg-slate-950/95 border border-white/20 text-white font-hud text-xs shadow-xl whitespace-nowrap pointer-events-none">
                      #{t.rank} {t.name} — {t.pts} PTS
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
