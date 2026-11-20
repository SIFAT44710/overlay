'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StandingTeam {
  rank: string;
  rankNum?: number;
  tag: string;
  name: string;
  booyah: number;
  elims: number;
  place: number;
  total: number;
  damage?: number;
  logoUrl?: string | null;
  col: string;
}

const DEFAULT_STANDING: StandingTeam[] = [
  { rank: '1ST',  tag: 'TOP', name: 'TOP', booyah: 1, elims: 94, place: 40, total: 134, col: '#F5B700' },
  { rank: '2ND',  tag: 'EXE', name: 'EXE', booyah: 0, elims: 76, place: 22, total: 98,  col: '#6225A6' },
  { rank: '3RD',  tag: 'S9x', name: 'S9x', booyah: 2, elims: 62, place: 34, total: 96,  col: '#00DF82' },
  { rank: '4TH',  tag: 'CME', name: 'CME', booyah: 0, elims: 58, place: 35, total: 93,  col: '#EC008C' },
  { rank: '5TH',  tag: 'TRX', name: 'TRX', booyah: 1, elims: 49, place: 36, total: 85,  col: '#38BDF8' },
  { rank: '6TH',  tag: 'UEO', name: 'UEO', booyah: 1, elims: 50, place: 28, total: 78,  col: '#8B5CF6' },
  { rank: '7TH',  tag: 'NK',  name: 'NK',  booyah: 0, elims: 46, place: 23, total: 69,  col: '#F97316' },
  { rank: '8TH',  tag: '69',  name: '69',  booyah: 0, elims: 48, place: 13, total: 61,  col: '#E11D48' },
  { rank: '9TH',  tag: 'JG',  name: 'JG',  booyah: 0, elims: 35, place: 23, total: 58,  col: '#14B8A6' },
  { rank: '10TH', tag: 'ITZ', name: 'ITZ', booyah: 0, elims: 22, place: 14, total: 36,  col: '#64748B' },
  { rank: '11TH', tag: 'EGL', name: 'EGL', booyah: 0, elims: 16, place: 17, total: 33,  col: '#475569' },
  { rank: '12TH', tag: 'SG',  name: 'SG',  booyah: 0, elims: 0,  place: 0,  total: 0,   col: '#334155' },
];

const DEFAULT_COLORS = {
  headerGold: '#F5B700',
  headerPurple: '#6225A6',
  headerDark: '#2E0E56',
  rank1GradStart: '#1e0b36',
  rank1GradMid: '#3b136b',
  rank1GradEnd: '#6225A6',
  rowGradStart: 'rgba(22,10,42,0.94)',
  rowGradMid: 'rgba(46,14,86,0.92)',
  rowGradEnd: 'rgba(98,37,166,0.88)',
  totalPtsGold: '#F5B700',
  fireColor: '#8B5CF6',
};

export default function Dashboard1({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [wipeKey, setWipeKey] = useState(0);

  // Poll Google Sheet DayStanding and Vmix APIs every 2 seconds for instant updates
  const { data: dayData } = useSWR('/api/daystanding', fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  });

  const { data: sheetData } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  });

  const { data: themeData } = useSWR('/api/theme', fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard1) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard1 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard1');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  // Merge live Google Sheet data using SHORT NAMES (Tags)
  const teams: StandingTeam[] = React.useMemo(() => {
    const formatRank = (idx: number) => {
      const n = idx + 1;
      if (n === 1) return '1ST';
      if (n === 2) return '2ND';
      if (n === 3) return '3RD';
      return `${n}TH`;
    };

    // 1. If Vmix match sheet was updated with live teams
    if (sheetData?.data && sheetData.data.length > 0) {
      const vmixRows = sheetData.data.filter((r: any) => r.TeamName && r.TeamName.trim() !== '');
      if (vmixRows.length >= 6) {
        return vmixRows.slice(0, 12).map((r: any, idx: number): StandingTeam => {
          const rawName = r.TeamName.trim();
          const tag = (r.Code || rawName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3)).toUpperCase();
          const elims = parseInt(r.Kill, 10) || 0;
          const place = parseInt(r['Survival Score'] || r.SurvivalScore || r.Place, 10) || 0;
          const total = parseInt(r.Total || r.TotalPoints, 10) || (elims + place);
          const booyah = parseInt(r.Booyah, 10) || 0;
          const damage = parseInt(r.Damage, 10) || 0;
          return {
            rank: formatRank(idx),
            rankNum: idx + 1,
            tag,
            name: tag, // User directive: use SHORT NAME
            booyah,
            elims,
            place,
            total,
            damage,
            logoUrl: r.LogoUrl || null,
            col: idx === 0 ? '#F5B700' : idx % 2 === 0 ? '#111827' : '#6225A6',
          };
        });
      }
    }

    // 2. DayStanding fallback
    if (dayData?.success && dayData.data && dayData.data.length > 0) {
      return dayData.data.slice(0, 12).map((t: any) => ({
        ...t,
        name: t.tag || t.name, // Short name
      }));
    }

    return DEFAULT_STANDING;
  }, [sheetData, dayData]);

  // Re-trigger entrance wipe on tab visibility change or OBS source show
  useEffect(() => {
    const handleVisChange = () => {
      if (!document.hidden) {
        setWipeKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);
    window.addEventListener('obsSourceVisibleChanged', handleVisChange as any);
    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
      window.removeEventListener('obsSourceVisibleChanged', handleVisChange as any);
    };
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background/Header Flame Effect (100% transparent/white friendly) */}
      <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none opacity-80">
        <FlameEffect color={colors.fireColor || colors.headerPurple} height={120} opacity={0.7} />
      </div>

      {/* Main Transparent Overlay Stage */}
      <div key={wipeKey} className="w-full max-w-4xl relative z-10">
        {/* FFWS Purple Starburst Stinger Flash */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20 overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-80 h-80 stinger-flash">
            <polygon
              points="150,10 185,110 290,115 205,175 235,280 150,215 65,280 95,175 10,115 115,110"
              fill={colors.headerPurple}
              fillOpacity="0.75"
            />
          </svg>
        </div>

        {/* Column Headers (Clean 6-Column Grid without Delta) */}
        <div className="grid grid-cols-[62px_1fr_64px_64px_76px_74px] items-center gap-1.5 px-1 mb-1.5 font-hud text-[10px] font-extrabold uppercase tracking-wider">
          <span />
          <span />
          <span
            className="skew-tag text-black text-center py-0.5 border border-black shadow-sm"
            style={{ backgroundColor: colors.headerGold }}
          >
            <span className="unskew-tag inline-block">BOOYAHS</span>
          </span>
          <span
            className="skew-tag text-white text-center py-0.5 border border-purple-500/40 shadow-sm"
            style={{ backgroundColor: colors.headerDark }}
          >
            <span className="unskew-tag inline-block">ELIMS</span>
          </span>
          <span
            className="skew-tag text-white text-center py-0.5 border border-purple-500/40 shadow-sm"
            style={{ backgroundColor: colors.headerDark }}
          >
            <span className="unskew-tag inline-block">PLACE PTS</span>
          </span>
          <span
            className="skew-tag text-center py-0.5 border border-black shadow-sm"
            style={{
              backgroundColor: colors.headerPurple,
              color: colors.totalPtsGold,
            }}
          >
            <span className="unskew-tag inline-block">TOTAL PTS</span>
          </span>
        </div>

        {/* All 12 Cascading Wipe Rows */}
        <div className="space-y-1">
          {teams.map((t, i) => {
            const isFirst = i === 0;

            const rowBg = isFirst
              ? `linear-gradient(90deg, ${colors.rank1GradStart} 0%, ${colors.rank1GradMid} 65%, ${colors.rank1GradEnd} 100%)`
              : `linear-gradient(90deg, ${colors.rowGradStart} 0%, ${colors.rowGradMid} 75%, ${colors.rowGradEnd} 100%)`;

            return (
              <div
                key={i}
                className="ffws-row grid grid-cols-[62px_1fr_64px_64px_76px_74px] items-center gap-1.5 rounded-sm overflow-hidden border border-black/70 shadow-md"
                style={{
                  animationDelay: `${140 + i * 68}ms`,
                  background: rowBg,
                }}
              >
                {/* Rank Badge */}
                <div
                  className={`h-9 flex items-center justify-center font-hud text-xs sm:text-sm font-extrabold italic border-r border-white/10 ${
                    isFirst ? 'text-black' : 'bg-black/45 text-white'
                  }`}
                  style={{
                    backgroundColor: isFirst ? colors.headerGold : undefined,
                  }}
                >
                  {t.rank}
                </div>

                {/* Team Tag & Name + Logo */}
                <div className="flex items-center gap-2.5 pl-2 pr-2 truncate">
                  {t.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.logoUrl}
                      alt={t.tag}
                      className="w-6 h-6 object-contain rounded border border-black shrink-0 bg-black/40"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center font-hud text-[9.5px] font-extrabold border border-black shrink-0"
                      style={{
                        backgroundColor: t.col,
                        color:
                          t.col === '#F5B700' || t.col === '#00DF82'
                            ? '#000000'
                            : '#ffffff',
                      }}
                    >
                      {t.tag}
                    </span>
                  )}
                  <span className="font-title text-sm sm:text-base font-bold text-white truncate tracking-wide">
                    {t.tag}
                  </span>
                </div>

                {/* Booyah */}
                <div className="text-center font-hud text-sm font-bold text-white">
                  {t.booyah}
                </div>

                {/* Elims (Kills) */}
                <div className="text-center font-hud text-sm font-bold text-slate-200">
                  {t.elims}
                </div>

                {/* Place Pts (Survival) */}
                <div className="text-center font-hud text-sm font-bold text-slate-200">
                  {t.place}
                </div>

                {/* Total Pts */}
                <div
                  className={`h-9 flex items-center justify-center font-hud text-sm sm:text-base font-extrabold ${
                    isFirst ? 'text-black' : 'bg-black/35'
                  }`}
                  style={{
                    backgroundColor: isFirst ? colors.headerGold : undefined,
                    color: isFirst ? '#000000' : colors.totalPtsGold,
                  }}
                >
                  {t.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
