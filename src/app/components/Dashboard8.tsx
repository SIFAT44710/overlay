'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TeamItem {
  tag: string;
  name: string;
  pts: number;
  surv: number;
  kill: number;
  dmg: number;
  col: string;
  textDark?: boolean;
}

const DEFAULT_TEAMS: TeamItem[] = [
  { tag: 'TOP', name: 'RAAD VAI YT', pts: 134, surv: 40, kill: 94, dmg: 57261, col: '#F5B700', textDark: true },
  { tag: 'EXE', name: 'EXTREME EX', pts: 98, surv: 22, kill: 76, dmg: 42349, col: '#6225A6' },
  { tag: 'S9x', name: 'SNEAKY9X', pts: 96, surv: 34, kill: 62, dmg: 41088, col: '#00DF82', textDark: true },
  { tag: 'CME', name: 'COFFIN MAKERS', pts: 93, surv: 35, kill: 58, dmg: 44026, col: '#EC008C' },
  { tag: 'TRX', name: 'TITANOVA REX', pts: 85, surv: 36, kill: 49, dmg: 31573, col: '#111827' },
  { tag: 'UEO', name: 'TEAM UNIONIZED', pts: 78, surv: 28, kill: 50, dmg: 29641, col: '#6225A6' },
  { tag: 'NK', name: 'NOVA KNIGHT', pts: 69, surv: 23, kill: 46, dmg: 26408, col: '#111827' },
  { tag: '69', name: '69 ESPORTS', pts: 61, surv: 13, kill: 48, dmg: 27036, col: '#6225A6' },
  { tag: 'JG', name: 'JUMA GAMING', pts: 58, surv: 23, kill: 35, dmg: 23365, col: '#111827' },
  { tag: 'ITZ', name: 'ITZ KABBO', pts: 36, surv: 14, kill: 22, dmg: 15660, col: '#6225A6' },
  { tag: 'EGL', name: 'TEAM EAGLE', pts: 33, surv: 17, kill: 16, dmg: 11037, col: '#111827' },
  { tag: 'SG', name: 'SADIA GAMING', pts: 0, surv: 0, kill: 0, dmg: 892, col: '#475569' },
];

const DEFAULT_COLORS = {
  col1: '#F5B700',
  colDark: '#111827',
  colPurple: '#6225A6',
  borderCol: '#000000',
  textNum: '#000000',
};

export default function Dashboard8({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animatedValues, setAnimatedValues] = useState<number[]>(new Array(12).fill(0));
  const [barHeights, setBarHeights] = useState<number[]>(new Array(12).fill(0));
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard8) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard8 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard8');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  // Merge live Google Sheet data (DayStanding priority, Vmix fallback)
  const teams: TeamItem[] = React.useMemo(() => {
    if (dayData?.success && dayData.data && dayData.data.length > 0) {
      return dayData.data.slice(0, 12).map((r: any, idx: number): TeamItem => ({
        tag: r.tag || (r.name ? r.name.slice(0, 3).toUpperCase() : `T${idx + 1}`),
        name: r.name,
        pts: typeof r.total === 'number' ? r.total : parseInt(r.total, 10) || 0,
        surv: typeof r.place === 'number' ? r.place : parseInt(r.place, 10) || 0,
        kill: typeof r.elims === 'number' ? r.elims : parseInt(r.elims, 10) || 0,
        dmg: typeof r.damage === 'number' ? r.damage : parseInt(r.damage, 10) || 0,
        col: idx === 0 ? colors.col1 : idx % 2 === 0 ? colors.colDark : colors.colPurple,
        textDark: idx === 0,
      }));
    }

    const raw = sheetData?.data || [];
    if (!raw.length) return DEFAULT_TEAMS;
    const mapped = raw
      .filter((r: any) => r.TeamName && r.TeamName.trim() !== '')
      .map((r: any, idx: number): TeamItem => {
        const kill = parseInt(r.Kill, 10) || 0;
        const pts = parseInt(r.Total || r.TotalPoints || r.TotalPts || r.Pts || r.Kill, 10) || kill;
        const dmg = parseInt(r.Damage, 10) || 0;
        const name = r.TeamName.trim();
        const tag = name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3).toUpperCase();
        return {
          tag,
          name,
          pts,
          surv: Math.max(0, pts - kill),
          kill,
          dmg,
          col: idx === 0 ? colors.col1 : idx % 2 === 0 ? colors.colDark : colors.colPurple,
          textDark: idx === 0,
        };
      });
    return mapped.length >= 6 ? mapped.slice(0, 12) : DEFAULT_TEAMS;
  }, [dayData, sheetData, colors]);

  const maxPts = Math.max(140, ...teams.map((t: TeamItem) => t.pts));

  useEffect(() => {
    // Reset heights
    setBarHeights(new Array(teams.length).fill(0));
    setAnimatedValues(new Array(teams.length).fill(0));

    const timers: NodeJS.Timeout[] = [];
    teams.forEach((t: TeamItem, i: number) => {
      const tId = setTimeout(() => {
        setBarHeights((prev) => {
          const next = [...prev];
          next[i] = Math.max(4, (t.pts / maxPts) * 100);
          return next;
        });

        // Tween number
        const start = performance.now();
        const duration = 1200;
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(t.pts * eased);
          setAnimatedValues((prev) => {
            const next = [...prev];
            next[i] = current;
            return next;
          });
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 100 + i * 85);
      timers.push(tId);
    });

    return () => timers.forEach(clearTimeout);
  }, [teams, maxPts]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 sm:p-6 bg-transparent select-none">
      <div className="w-full max-w-5xl px-2">
        {/* Bars Container */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-80 pt-8 border-b-[3px] border-black pb-2">
          {teams.map((t: TeamItem, i: number) => {
            const barBg =
              i === 0
                ? colors.col1
                : i % 2 === 0
                ? colors.colDark
                : colors.colPurple;
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-end h-full cursor-pointer relative group"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${t.name} — ${t.pts} PTS (${t.kill} Kills, ${t.dmg.toLocaleString()} DMG)`,
                  })
                }
                onMouseMove={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${t.name} — ${t.pts} PTS (${t.kill} Kills, ${t.dmg.toLocaleString()} DMG)`,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  className="font-num text-xs sm:text-sm font-extrabold mb-1"
                  style={{ color: colors.textNum }}
                >
                  {animatedValues[i]}
                </div>
                <div className="w-full max-w-[38px] flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md border-2 border-b-0 transition-all duration-1000"
                    style={{
                      height: `${barHeights[i]}%`,
                      backgroundColor: barBg,
                      borderColor: colors.borderCol,
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Badges & Names */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-3">
          {teams.map((t: TeamItem, i: number) => {
            const badgeBg =
              i === 0
                ? colors.col1
                : i % 2 === 0
                ? colors.colDark
                : colors.colPurple;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center cursor-pointer group"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${t.name} — ${t.pts} PTS (${t.kill} Kills, ${t.dmg.toLocaleString()} DMG)`,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center font-num text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_#000] shrink-0"
                  style={{
                    backgroundColor: badgeBg,
                    color: i === 0 ? '#000000' : '#ffffff',
                  }}
                >
                  {t.tag}
                </div>
                <span className="font-title text-[10px] sm:text-[11px] font-bold text-black leading-tight mt-1 max-w-[68px] truncate">
                  {t.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dark Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold font-num shadow-xl border-2 border-[#6225A6]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 34 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
