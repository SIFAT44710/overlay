'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Spark {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  tx: string;
  ty: string;
  dur: string;
}

const DEFAULT_H2H = {
  a: { name: 'RAAD VAI YT', tag: 'TOP', total: 134, kills: 94, surv: 40, damage: 57261, hs: 89, gloo: 297 },
  b: { name: 'EXTREME EX', tag: 'EXE', total: 98, kills: 76, surv: 22, damage: 42349, hs: 67, gloo: 340 },
};

const DEFAULT_COLORS = {
  teamABg: '#111827',
  teamBBg: '#6225A6',
  vsBadge: '#F5B700',
  labelColor: '#6225A6',
  accentGold: '#F5B700',
  accentMint: '#00DF82',
};

export default function Dashboard10({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [nameplatesVisible, setNameplatesVisible] = useState(false);
  const [shockActive, setShockActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [barWidthsA, setBarWidthsA] = useState<number[]>(new Array(6).fill(0));
  const [barWidthsB, setBarWidthsB] = useState<number[]>(new Array(6).fill(0));
  const [numbersA, setNumbersA] = useState<number[]>(new Array(6).fill(0));
  const [numbersB, setNumbersB] = useState<number[]>(new Array(6).fill(0));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard10) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard10 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard10');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  // Extract top 2 teams from live sheet (Live match Vmix priority, DayStanding fallback)
  const h2h = React.useMemo(() => {
    // 1. Live match Vmix priority
    const raw = sheetData?.data || [];
    if (raw.length >= 2) {
      const t1 = raw[0];
      const t2 = raw[1];
      const t1Kill = parseInt(t1.Kill, 10) || 0;
      const t1Pts = parseInt(t1.Total || t1.TotalPoints || t1.Pts || t1.Kill, 10) || t1Kill;
      const t1Surv = parseInt(t1['Survival Score'] || t1.SurvivalScore, 10) || Math.max(0, t1Pts - t1Kill);
      const t1Dmg = parseInt(t1.Damage, 10) || 0;

      const t2Kill = parseInt(t2.Kill, 10) || 0;
      const t2Pts = parseInt(t2.Total || t2.TotalPoints || t2.Pts || t2.Kill, 10) || t2Kill;
      const t2Surv = parseInt(t2['Survival Score'] || t2.SurvivalScore, 10) || Math.max(0, t2Pts - t2Kill);
      const t2Dmg = parseInt(t2.Damage, 10) || 0;

      const nameA = t1.TeamName ? t1.TeamName.trim() : DEFAULT_H2H.a.name;
      const nameB = t2.TeamName ? t2.TeamName.trim() : DEFAULT_H2H.b.name;

      return {
        a: {
          name: nameA,
          tag: nameA.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3).toUpperCase(),
          total: t1Pts,
          kills: t1Kill,
          surv: t1Surv,
          damage: t1Dmg || DEFAULT_H2H.a.damage,
          hs: Math.round(t1Kill * 0.9) || DEFAULT_H2H.a.hs,
          gloo: Math.round(t1Kill * 3.1) || DEFAULT_H2H.a.gloo,
        },
        b: {
          name: nameB,
          tag: nameB.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3).toUpperCase(),
          total: t2Pts,
          kills: t2Kill,
          surv: t2Surv,
          damage: t2Dmg || DEFAULT_H2H.b.damage,
          hs: Math.round(t2Kill * 0.9) || DEFAULT_H2H.b.hs,
          gloo: Math.round(t2Kill * 3.4) || DEFAULT_H2H.b.gloo,
        },
      };
    }

    // 2. DayStanding fallback
    if (dayData?.success && dayData.data && dayData.data.length >= 2) {
      const t1 = dayData.data[0];
      const t2 = dayData.data[1];
      const t1Total = typeof t1.total === 'number' ? t1.total : parseInt(t1.total, 10) || 0;
      const t1Kill = typeof t1.elims === 'number' ? t1.elims : parseInt(t1.elims, 10) || 0;
      const t2Total = typeof t2.total === 'number' ? t2.total : parseInt(t2.total, 10) || 0;
      const t2Kill = typeof t2.elims === 'number' ? t2.elims : parseInt(t2.elims, 10) || 0;
      return {
        a: {
          name: t1.name || DEFAULT_H2H.a.name,
          tag: t1.tag || (t1.name ? t1.name.slice(0, 3).toUpperCase() : 'TOP'),
          total: t1Total,
          kills: t1Kill,
          surv: typeof t1.place === 'number' ? t1.place : Math.max(0, t1Total - t1Kill),
          damage: typeof t1.damage === 'number' ? t1.damage : parseInt(t1.damage, 10) || DEFAULT_H2H.a.damage,
          hs: Math.round(t1Kill * 0.9) || DEFAULT_H2H.a.hs,
          gloo: Math.round(t1Kill * 3.1) || DEFAULT_H2H.a.gloo,
        },
        b: {
          name: t2.name || DEFAULT_H2H.b.name,
          tag: t2.tag || (t2.name ? t2.name.slice(0, 3).toUpperCase() : 'EXE'),
          total: t2Total,
          kills: t2Kill,
          surv: typeof t2.place === 'number' ? t2.place : Math.max(0, t2Total - t2Kill),
          damage: typeof t2.damage === 'number' ? t2.damage : parseInt(t2.damage, 10) || DEFAULT_H2H.b.damage,
          hs: Math.round(t2Kill * 0.9) || DEFAULT_H2H.b.hs,
          gloo: Math.round(t2Kill * 3.4) || DEFAULT_H2H.b.gloo,
        },
      };
    }

    return DEFAULT_H2H;
  }, [sheetData, dayData]);

  const pctA = Math.round((h2h.a.total / (h2h.a.total + h2h.b.total)) * 100) || 50;
  const pctB = 100 - pctA;

  const metrics = [
    { label: 'TOTAL PTS', va: h2h.a.total, vb: h2h.b.total },
    { label: 'KILLS', va: h2h.a.kills, vb: h2h.b.kills },
    { label: 'SURVIVAL PTS', va: h2h.a.surv, vb: h2h.b.surv },
    { label: 'DAMAGE', va: h2h.a.damage, vb: h2h.b.damage },
    { label: 'HEADSHOTS', va: h2h.a.hs, vb: h2h.b.hs },
    { label: 'GLOO USED', va: h2h.a.gloo, vb: h2h.b.gloo },
  ];

  useEffect(() => {
    // Reset state
    setNameplatesVisible(false);
    setShockActive(false);
    setBarWidthsA(new Array(6).fill(0));
    setBarWidthsB(new Array(6).fill(0));
    setNumbersA(new Array(6).fill(0));
    setNumbersB(new Array(6).fill(0));

    const timers: NodeJS.Timeout[] = [];

    // 1. Nameplates slide in
    timers.push(
      setTimeout(() => {
        setNameplatesVisible(true);
      }, 120)
    );

    // 2. Shockwave and fire sparks explosion
    timers.push(
      setTimeout(() => {
        setShockActive(true);
        // Generate sparks
        const sparkColors = ['#FFFBEB', '#FFD700', '#F5B700', '#EC008C', '#7C3AED', '#6225A6'];
        const list: Spark[] = [];
        for (let i = 0; i < 28; i++) {
          const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.4;
          const dist = 28 + Math.random() * 60;
          list.push({
            cx: 70,
            cy: 70,
            r: 2 + Math.random() * 3.5,
            fill: sparkColors[i % sparkColors.length],
            tx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
            ty: `${(Math.sin(angle) * dist - 8).toFixed(1)}px`,
            dur: `${(0.65 + Math.random() * 0.5).toFixed(2)}s`,
          });
        }
        setSparks(list);
      }, 620)
    );

    // 3. 6 Butterfly metric rows animate
    metrics.forEach((m, i) => {
      const rowMax = Math.max(m.va, m.vb) * 1.08;
      timers.push(
        setTimeout(() => {
          setBarWidthsA((prev) => {
            const next = [...prev];
            next[i] = (m.va / rowMax) * 100;
            return next;
          });
          setBarWidthsB((prev) => {
            const next = [...prev];
            next[i] = (m.vb / rowMax) * 100;
            return next;
          });

          // Tween numbers
          const start = performance.now();
          const duration = 1200;
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setNumbersA((prev) => {
              const next = [...prev];
              next[i] = Math.round(m.va * eased);
              return next;
            });
            setNumbersB((prev) => {
              const next = [...prev];
              next[i] = Math.round(m.vb * eased);
              return next;
            });
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, 720 + i * 170)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [h2h]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 sm:p-6 bg-transparent select-none">
      <div className="w-full max-w-4xl space-y-5">
        {/* Slanted Nameplates */}
        <div className="relative grid grid-cols-[1fr_92px_1fr] items-center gap-2">
          {/* Team A */}
          <div
            className="skew-box px-5 py-2.5 transition-all duration-700"
            style={{
              backgroundColor: colors.teamABg,
              color: '#ffffff',
              border: '2.5px solid #000000',
              boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.85)',
              opacity: nameplatesVisible ? 1 : 0,
              transform: nameplatesVisible
                ? 'skewX(-12deg) translateX(0)'
                : 'skewX(-12deg) translateX(-65px)',
            }}
          >
            <div className="unskew flex items-center justify-between">
              <div className="font-title text-2xl sm:text-3xl font-bold italic text-white truncate max-w-[220px]">
                {h2h.a.name}
              </div>
              <div
                className="font-num text-2xl font-bold ml-2"
                style={{ color: colors.accentGold }}
              >
                {pctA}%
              </div>
            </div>
          </div>

          {/* Center VS Badge with Shockwave & Sparks */}
          <div className="relative flex items-center justify-center h-20">
            <svg
              viewBox="0 0 140 140"
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            >
              <circle
                cx="70"
                cy="70"
                r="6"
                fill="none"
                stroke={colors.vsBadge}
                className={shockActive ? 'shock-run' : ''}
                style={{ opacity: shockActive ? 1 : 0 }}
              />
              <g>
                {sparks.map((s, idx) => (
                  <circle
                    key={idx}
                    cx={s.cx}
                    cy={s.cy}
                    r={s.r}
                    fill={s.fill}
                    className="spark-particle"
                    style={
                      {
                        '--tx': s.tx,
                        '--ty': s.ty,
                        '--dur': s.dur,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </g>
            </svg>
            <span
              className="relative z-10 px-3.5 py-1 rounded border-2 border-black font-title text-lg font-extrabold shadow-[3px_3px_0px_#000]"
              style={{ backgroundColor: colors.vsBadge, color: '#000000' }}
            >
              VS
            </span>
          </div>

          {/* Team B */}
          <div
            className="skew-box px-5 py-2.5 transition-all duration-700"
            style={{
              backgroundColor: colors.teamBBg,
              color: '#ffffff',
              border: '2.5px solid #000000',
              boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.85)',
              opacity: nameplatesVisible ? 1 : 0,
              transform: nameplatesVisible
                ? 'skewX(-12deg) translateX(0)'
                : 'skewX(-12deg) translateX(65px)',
            }}
          >
            <div className="unskew flex items-center justify-between">
              <div
                className="font-num text-2xl font-bold mr-2"
                style={{ color: colors.accentMint }}
              >
                {pctB}%
              </div>
              <div className="font-title text-2xl sm:text-3xl font-bold italic text-white text-right truncate max-w-[220px]">
                {h2h.b.name}
              </div>
            </div>
          </div>
        </div>

        {/* Transparent 6-Row Butterfly Bars */}
        <div className="space-y-3.5 px-1">
          {metrics.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_1fr] items-center gap-3">
              {/* Left Bar (Team A) */}
              <div className="flex items-center justify-end gap-2.5">
                <span className="font-num text-sm sm:text-base font-extrabold text-black">
                  {numbersA[i].toLocaleString()}
                </span>
                <div className="w-full h-5 bg-black/10 rounded-l overflow-hidden flex justify-end border border-black/30">
                  <div
                    className="bar-x h-full rounded-l"
                    style={{
                      width: `${barWidthsA[i]}%`,
                      backgroundColor: colors.teamABg,
                    }}
                  />
                </div>
              </div>

              {/* Center Metric Label */}
              <div
                className="text-center font-num text-xs font-extrabold tracking-wider"
                style={{ color: colors.labelColor }}
              >
                {m.label}
              </div>

              {/* Right Bar (Team B) */}
              <div className="flex items-center gap-2.5">
                <div className="w-full h-5 bg-black/10 rounded-r overflow-hidden border border-black/30">
                  <div
                    className="bar-x h-full rounded-r"
                    style={{
                      width: `${barWidthsB[i]}%`,
                      backgroundColor: colors.teamBBg,
                    }}
                  />
                </div>
                <span
                  className="font-num text-sm sm:text-base font-extrabold"
                  style={{ color: colors.teamBBg }}
                >
                  {numbersB[i].toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
