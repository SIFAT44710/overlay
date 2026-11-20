'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MapTeam {
  rank: number;
  tag: string;
  name: string;
  surv: number;
  kill: number;
  total: number;
  booyah: number;
  logoUrl?: string | null;
}

const DEFAULT_MAP_STANDINGS: MapTeam[] = [
  { rank: 1, tag: 'NK',  name: 'NK',  surv: 8,  kill: 23, total: 31, booyah: 0 },
  { rank: 2, tag: 'TOP', name: 'TOP', surv: 9,  kill: 21, total: 30, booyah: 0 },
  { rank: 3, tag: 'EXE', name: 'EXE', surv: 5,  kill: 20, total: 25, booyah: 0 },
  { rank: 4, tag: 'CME', name: 'CME', surv: 7,  kill: 17, total: 24, booyah: 0 },
  { rank: 5, tag: 'TRX', name: 'TRX', surv: 12, kill: 6,  total: 18, booyah: 1 },
  { rank: 6, tag: '69',  name: '69',  surv: 4,  kill: 12, total: 16, booyah: 0 },
  { rank: 7, tag: 'ITZ', name: 'ITZ', surv: 3,  kill: 9,  total: 12, booyah: 0 },
  { rank: 8, tag: 'JG',  name: 'JG',  surv: 6,  kill: 3,  total: 9,  booyah: 0 },
  { rank: 9, tag: 'S9x', name: 'S9x', surv: 1,  kill: 2,  total: 3,  booyah: 0 },
  { rank: 10, tag: 'UEO', name: 'UEO', surv: 2, kill: 1,  total: 3,  booyah: 0 },
];

const DEFAULT_COLORS = {
  survColor: '#2DD4BF',
  killColor: '#8B5CF6',
  fireColor: '#8B5CF6',
};

export default function Dashboard6({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [rowsVisible, setRowsVisible] = useState<boolean[]>(new Array(10).fill(false));
  const [widthsS, setWidthsS] = useState<number[]>(new Array(10).fill(0));
  const [widthsK, setWidthsK] = useState<number[]>(new Array(10).fill(0));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard6) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard6 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard6');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const teams: MapTeam[] = React.useMemo(() => {
    if (sheetData?.data && sheetData.data.length >= 6) {
      return sheetData.data.slice(0, 10).map((r: any, idx: number): MapTeam => {
        const rawName = r.TeamName.trim();
        const tag = (r.Code || rawName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3)).toUpperCase();
        const kill = parseInt(r.Kill, 10) || 0;
        const surv = parseInt(r['Survival Score'] || r.SurvivalScore || r.Place, 10) || 0;
        const total = parseInt(r.Total || r.TotalPoints, 10) || (kill + surv);
        const booyah = parseInt(r.Booyah, 10) || 0;
        return {
          rank: idx + 1,
          tag,
          name: tag, // Short name
          surv,
          kill,
          total,
          booyah,
          logoUrl: r.LogoUrl || null,
        };
      });
    }
    return DEFAULT_MAP_STANDINGS;
  }, [sheetData]);

  const maxT = 32;

  useEffect(() => {
    setRowsVisible(new Array(teams.length).fill(false));
    setWidthsS(new Array(teams.length).fill(0));
    setWidthsK(new Array(teams.length).fill(0));

    const timers: NodeJS.Timeout[] = [];
    teams.forEach((t, i) => {
      timers.push(
        setTimeout(() => {
          setRowsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          setWidthsS((prev) => {
            const next = [...prev];
            next[i] = (t.surv / maxT) * 100;
            return next;
          });
          setWidthsK((prev) => {
            const next = [...prev];
            next[i] = (t.kill / maxT) * 100;
            return next;
          });
        }, 120 + i * 95)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [teams]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-6 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.killColor} height={120} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl space-y-2 relative z-10">
        {/* Header Title with Color Legend */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B700] animate-ping" />
            <span className="font-hud text-xs font-bold uppercase tracking-wider text-white">
              MATCH STANDING — SPLIT SURVIVAL &amp; ELIMS
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-hud font-bold">
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors.survColor }} />
              SURVIVAL
            </span>
            <span className="flex items-center gap-1.5 text-violet-300">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors.killColor }} />
              ELIMS
            </span>
          </div>
        </div>

        {/* Rows */}
        {teams.map((t, i) => (
          <div
            key={t.tag}
            className="pop-card hud-card rounded-xl px-3.5 py-2 flex items-center gap-3 border border-white/10"
            style={{
              opacity: rowsVisible[i] ? 1 : 0,
              transform: rowsVisible[i] ? 'translateX(0)' : 'translateX(-30px)',
            }}
          >
            {/* Rank */}
            <span
              className={`font-hud text-sm font-bold w-6 text-center ${
                i === 0 ? 'text-amber-400 font-black' : 'text-slate-400'
              }`}
            >
              #{t.rank}
            </span>

            {/* Team Tag & Logo */}
            <div className="w-28 sm:w-36 flex items-center gap-2 truncate">
              {t.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.logoUrl}
                  alt={t.tag}
                  className="w-5 h-5 object-contain rounded shrink-0 bg-black/40"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <span className="font-hud text-sm font-bold text-white tracking-wide truncate">
                {t.tag}
              </span>
              {t.booyah > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-extrabold shrink-0">
                  BOOYAH
                </span>
              )}
            </div>

            {/* Split Progress Bar Container */}
            <div className="flex-1 h-5 bg-slate-900 rounded-md overflow-hidden flex">
              <div
                className="bar-grow-x h-full"
                style={{
                  width: `${widthsS[i]}%`,
                  background: colors.survColor,
                }}
              />
              <div
                className="bar-grow-x h-full"
                style={{
                  width: `${widthsK[i]}%`,
                  background: colors.killColor,
                }}
              />
            </div>

            {/* Total Points & Kills Callout */}
            <div className="w-28 text-right font-hud text-xs font-bold shrink-0">
              <span className="text-white text-sm">{t.total} PTS</span>
              <span className="text-slate-400 ml-1.5">({t.kill}K)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
