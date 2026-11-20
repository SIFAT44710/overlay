'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_H2H_DAY = {
  a: { name: 'S9x', tag: 'S9x', total: 96, kills: 62, surv: 34, damage: 41088, hs: 51, booyah: 2 },
  b: { name: 'UEO', tag: 'UEO', total: 78, kills: 50, surv: 28, damage: 29641, hs: 41, booyah: 1 },
};

const DEFAULT_COLORS = {
  teamAColor: '#8B5CF6',
  teamBColor: '#2DD4BF',
  fireColor: '#8B5CF6',
};

export default function Dashboard8({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [widthsA, setWidthsA] = useState<number[]>(new Array(6).fill(0));
  const [widthsB, setWidthsB] = useState<number[]>(new Array(6).fill(0));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

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

  const h2h = React.useMemo(() => {
    if (dayData?.success && dayData.data && dayData.data.length >= 2) {
      const t1 = dayData.data[0];
      const t2 = dayData.data[1];
      const tag1 = t1.tag || t1.name?.slice(0, 3).toUpperCase() || 'TOP';
      const tag2 = t2.tag || t2.name?.slice(0, 3).toUpperCase() || 'EXE';
      const tot1 = typeof t1.total === 'number' ? t1.total : parseInt(t1.total, 10) || 134;
      const tot2 = typeof t2.total === 'number' ? t2.total : parseInt(t2.total, 10) || 98;
      const k1 = typeof t1.elims === 'number' ? t1.elims : parseInt(t1.elims, 10) || 94;
      const k2 = typeof t2.elims === 'number' ? t2.elims : parseInt(t2.elims, 10) || 76;
      return {
        a: {
          name: tag1,
          tag: tag1,
          total: tot1,
          kills: k1,
          surv: typeof t1.place === 'number' ? t1.place : Math.max(0, tot1 - k1),
          damage: typeof t1.damage === 'number' ? t1.damage : parseInt(t1.damage, 10) || 57261,
          hs: Math.round(k1 * 0.9) || 89,
          booyah: typeof t1.booyah === 'number' ? t1.booyah : parseInt(t1.booyah, 10) || 1,
        },
        b: {
          name: tag2,
          tag: tag2,
          total: tot2,
          kills: k2,
          surv: typeof t2.place === 'number' ? t2.place : Math.max(0, tot2 - k2),
          damage: typeof t2.damage === 'number' ? t2.damage : parseInt(t2.damage, 10) || 42349,
          hs: Math.round(k2 * 0.9) || 67,
          booyah: typeof t2.booyah === 'number' ? t2.booyah : parseInt(t2.booyah, 10) || 0,
        },
      };
    }
    return DEFAULT_H2H_DAY;
  }, [dayData]);

  const { a, b } = h2h;

  const metrics = [
    { label: 'TOTAL PTS', va: a.total, vb: b.total, max: Math.max(140, a.total, b.total) },
    { label: 'KILLS', va: a.kills, vb: b.kills, max: Math.max(100, a.kills, b.kills) },
    { label: 'SURVIVAL PTS', va: a.surv, vb: b.surv, max: Math.max(50, a.surv, b.surv) },
    { label: 'TOTAL DAMAGE', va: a.damage, vb: b.damage, max: Math.max(60000, a.damage, b.damage) },
    { label: 'HEADSHOTS', va: a.hs, vb: b.hs, max: Math.max(90, a.hs, b.hs) },
    { label: 'BOOYAHS', va: a.booyah, vb: b.booyah, max: Math.max(3, a.booyah, b.booyah) },
  ];

  useEffect(() => {
    setWidthsA(new Array(6).fill(0));
    setWidthsB(new Array(6).fill(0));

    const timers: NodeJS.Timeout[] = [];
    metrics.forEach((m, i) => {
      timers.push(
        setTimeout(() => {
          setWidthsA((prev) => {
            const next = [...prev];
            next[i] = Math.min(100, (m.va / m.max) * 100);
            return next;
          });
          setWidthsB((prev) => {
            const next = [...prev];
            next[i] = Math.min(100, (m.vb / m.max) * 100);
            return next;
          });
        }, 160 + i * 160)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [h2h]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-6 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.teamAColor} height={130} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl hud-card rounded-2xl p-5 space-y-4 relative z-10 border border-white/10">
        {/* Top Header with Team Short Names */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="font-hud text-xl sm:text-2xl font-bold text-violet-400 tracking-wide">
            {a.tag}
          </div>
          <span className="px-3.5 py-1 rounded-full bg-amber-400 text-black text-xs font-hud font-black uppercase tracking-wider">
            DAY H2H BUTTERFLY
          </span>
          <div className="font-hud text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">
            {b.tag}
          </div>
        </div>

        {/* 6 Butterfly Metrics */}
        <div className="space-y-3 pt-1">
          {metrics.map((m, i) => (
            <div key={m.label} className="grid grid-cols-[1fr_120px_1fr] items-center gap-3">
              {/* Left Bar (Team A) */}
              <div className="flex items-center justify-end gap-2.5">
                <span className="font-hud text-sm font-bold text-white shrink-0">
                  {m.va.toLocaleString()}
                </span>
                <div className="w-full h-5 bg-slate-900 rounded-l-md overflow-hidden flex justify-end">
                  <div
                    className="bar-grow-x h-full rounded-l-md"
                    style={{
                      width: `${widthsA[i]}%`,
                      background: colors.teamAColor,
                    }}
                  />
                </div>
              </div>

              {/* Center Metric Label */}
              <div className="text-center font-hud text-[11px] font-bold text-slate-300 tracking-wider">
                {m.label}
              </div>

              {/* Right Bar (Team B) */}
              <div className="flex items-center gap-2.5">
                <div className="w-full h-5 bg-slate-900 rounded-r-md overflow-hidden">
                  <div
                    className="bar-grow-x h-full rounded-r-md"
                    style={{
                      width: `${widthsB[i]}%`,
                      background: colors.teamBColor,
                    }}
                  />
                </div>
                <span className="font-hud text-sm font-bold text-white shrink-0">
                  {m.vb.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
