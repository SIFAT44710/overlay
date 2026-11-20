'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

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
  { rank: 1,  tag: 'TOP', name: 'TOP', pts: 134, col: '#F5B700' },
  { rank: 2,  tag: 'EXE', name: 'EXE', pts: 98,  col: '#E11D48' },
  { rank: 3,  tag: 'S9x', name: 'S9x', pts: 96,  col: '#8B5CF6' },
  { rank: 4,  tag: 'CME', name: 'CME', pts: 93,  col: '#2DD4BF' },
  { rank: 5,  tag: 'TRX', name: 'TRX', pts: 85,  col: '#38BDF8' },
  { rank: 6,  tag: 'UEO', name: 'UEO', pts: 78,  col: '#6366F1' },
  { rank: 7,  tag: 'NK',  name: 'NK',  pts: 69,  col: '#A78BFA' },
  { rank: 8,  tag: '69',  name: '69',  pts: 61,  col: '#F43F5E' },
  { rank: 9,  tag: 'JG',  name: 'JG',  pts: 58,  col: '#14B8A6' },
  { rank: 10, tag: 'ITZ', name: 'ITZ', pts: 36,  col: '#60A5FA' },
  { rank: 11, tag: 'EGL', name: 'EGL', pts: 33,  col: '#94A3B8' },
  { rank: 12, tag: 'SG',  name: 'SG',  pts: 0,   col: '#64748B' },
];

const DEFAULT_COLORS = {
  headerColor: '#F5B700',
  fireColor: '#8B5CF6',
  gridColor: 'rgba(148, 163, 184, 0.15)',
};

export default function Dashboard11({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animated, setAnimated] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard11) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard11 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard11');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Compute live teams from sheet/daystanding
  const teams: ColumnTeam[] = React.useMemo(() => {
    const source = dayData?.standing || sheetData?.data || [];
    if (source.length >= 6) {
      return source.slice(0, 12).map((row: any, idx: number) => {
        const pts = parseInt(row.total ?? row.Total ?? row.pts ?? 0, 10);
        const tag = row.tag || (row.TeamName ? row.TeamName.slice(0, 3).toUpperCase() : DEFAULT_TEAMS[idx]?.tag || `T${idx+1}`);
        const col = DEFAULT_TEAMS[idx]?.col || '#8B5CF6';
        return {
          rank: idx + 1,
          tag,
          name: tag,
          pts,
          col,
          logoUrl: row.logoUrl || null,
        };
      });
    }
    return DEFAULT_TEAMS;
  }, [dayData, sheetData]);

  const maxPts = Math.max(1, ...teams.map((t) => t.pts));

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Background Flame Aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || '#F5B700'} height={480} opacity={0.65} />
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center">
        {/* Title Badge */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className="px-4 py-1 rounded-full font-hud text-xs font-black text-black tracking-widest uppercase shadow-lg"
            style={{ backgroundColor: colors.headerColor || '#F5B700' }}
          >
            TOTAL POINTS RANKING
          </span>
          <span className="text-xs font-bold text-slate-400 font-hud tracking-wider">
            ALL 12 CONTENDERS
          </span>
        </div>

        {/* 12 Columns Stage */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl p-6 backdrop-blur-md bg-black/60 border border-white/10 shadow-2xl flex flex-col justify-end">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-x-6 top-8 bottom-16 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="w-full border-b border-white" />
            <div className="w-full border-b border-white" />
            <div className="w-full border-b border-white" />
            <div className="w-full border-b border-white" />
          </div>

          {/* Bar Chart Container */}
          <div className="relative z-10 w-full h-full flex items-end justify-between gap-1.5 sm:gap-3 pb-8">
            {teams.map((t, idx) => {
              const heightPct = (t.pts / maxPts) * 100;
              const delaySec = idx * 0.08;

              return (
                <div
                  key={t.tag}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 10,
                      text: `#${t.rank} ${t.tag} — ${t.pts} PTS`,
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Points Counter Badge */}
                  <div
                    className="font-hud text-[11px] sm:text-xs font-black text-white mb-1.5 transition-all duration-700"
                    style={{
                      opacity: animated ? 1 : 0,
                      transform: animated ? 'translateY(0)' : 'translateY(10px)',
                      transitionDelay: `${delaySec + 0.3}s`,
                    }}
                  >
                    {t.pts}
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[48px] rounded-t-lg relative overflow-hidden bg-white/5 border border-white/10 flex flex-col justify-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        backgroundColor: t.col,
                        height: animated ? `${Math.max(6, heightPct)}%` : '0%',
                        transitionDelay: `${delaySec}s`,
                        boxShadow: `0 0 16px ${t.col}66`,
                      }}
                    >
                      {/* Top gloss strip */}
                      <div className="w-full h-1 bg-white/40" />
                    </div>
                  </div>

                  {/* Bottom Team Tag & Logo */}
                  <div className="absolute -bottom-8 flex flex-col items-center">
                    {t.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={t.logoUrl}
                        alt={t.tag}
                        className="w-4 h-4 object-contain rounded-full border border-black/50 bg-black/40 mb-0.5"
                      />
                    ) : null}
                    <span
                      className="font-hud text-[10px] sm:text-xs font-black tracking-tight"
                      style={{ color: t.col }}
                    >
                      {t.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {activeTooltip && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-400 text-amber-300 font-hud text-xs font-bold shadow-2xl -translate-x-1/2 -translate-y-full"
          style={{ left: activeTooltip.x, top: activeTooltip.y }}
        >
          {activeTooltip.text}
        </div>
      )}
    </div>
  );
}
