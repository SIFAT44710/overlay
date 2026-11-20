'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_DUEL = {
  p1: { name: 'TOP.1SHOVO', team: 'TOP', tag: 'TOP', kills: 29, damage: 11859, hs: 31, assist: 22 },
  p2: { name: 'EXE.SEJAN', team: 'EXE', tag: 'EXE', kills: 27, damage: 11890, hs: 22, assist: 13 },
};

const DEFAULT_COLORS = {
  p1Color: '#8B5CF6',
  p2Color: '#2DD4BF',
  accentGold: '#F5B700',
  fireColor: '#8B5CF6',
};

export default function Dashboard3({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [percent1, setPercent1] = useState(0);
  const [percent2, setPercent2] = useState(0);
  const [arcOffset1, setArcOffset1] = useState(Math.PI * 125);
  const [arcOffset2, setArcOffset2] = useState(Math.PI * 125);
  const [sparkPos, setSparkPos] = useState({ cx: 55, cy: 170 });
  const [shockActive, setShockActive] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState<boolean[]>([false, false, false, false]);
  const [barWidthsA, setBarWidthsA] = useState<number[]>([0, 0, 0, 0]);
  const [barWidthsB, setBarWidthsB] = useState<number[]>([0, 0, 0, 0]);
  const [valsA, setValsA] = useState<number[]>([0, 0, 0, 0]);
  const [valsB, setValsB] = useState<number[]>([0, 0, 0, 0]);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: duelData } = useSWR('/api/sheet7', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard3) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard3 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard3');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const duel = React.useMemo(() => {
    if (duelData?.player1 && duelData?.player2) {
      const p1 = duelData.player1;
      const p2 = duelData.player2;
      const t1Tag = (p1[0] || 'TOP').slice(0, 3).toUpperCase();
      const t2Tag = (p2[0] || 'EXE').slice(0, 3).toUpperCase();
      return {
        p1: {
          name: p1[2] || DEFAULT_DUEL.p1.name,
          team: t1Tag,
          tag: t1Tag,
          kills: parseInt(p1[3], 10) || DEFAULT_DUEL.p1.kills,
          damage: parseInt(p1[4], 10) || DEFAULT_DUEL.p1.damage,
          assist: parseInt(p1[5], 10) || DEFAULT_DUEL.p1.assist,
          hs: parseInt(p1[8], 10) || DEFAULT_DUEL.p1.hs,
        },
        p2: {
          name: p2[2] || DEFAULT_DUEL.p2.name,
          team: t2Tag,
          tag: t2Tag,
          kills: parseInt(p2[3], 10) || DEFAULT_DUEL.p2.kills,
          damage: parseInt(p2[4], 10) || DEFAULT_DUEL.p2.damage,
          assist: parseInt(p2[5], 10) || DEFAULT_DUEL.p2.assist,
          hs: parseInt(p2[8], 10) || DEFAULT_DUEL.p2.hs,
        },
      };
    }
    return DEFAULT_DUEL;
  }, [duelData]);

  const s1 = duel.p1.kills * 100 + duel.p1.damage * 0.1 + duel.p1.hs * 40;
  const s2 = duel.p2.kills * 100 + duel.p2.damage * 0.1 + duel.p2.hs * 40;
  const pct1 = Math.round((s1 / (s1 + s2)) * 100) || 50;
  const pct2 = 100 - pct1;

  const R = 125;
  const CX = 180;
  const CY = 170;
  const ARC = Math.PI * R;
  const theta = Math.PI * (1 - pct1 / 100);
  const px = CX + R * Math.cos(theta);
  const py = CY - R * Math.sin(theta);

  const rows = [
    { label: 'ELIMINATIONS', a: duel.p1.kills, b: duel.p2.kills },
    { label: 'TOTAL DAMAGE', a: duel.p1.damage, b: duel.p2.damage },
    { label: 'HEADSHOTS', a: duel.p1.hs, b: duel.p2.hs },
    { label: 'ASSISTS', a: duel.p1.assist, b: duel.p2.assist },
  ];

  useEffect(() => {
    // Reset
    setArcOffset1(ARC);
    setArcOffset2(ARC);
    setSparkPos({ cx: 55, cy: 170 });
    setPercent1(0);
    setPercent2(0);
    setShockActive(false);
    setLabelsVisible([false, false, false, false]);
    setBarWidthsA([0, 0, 0, 0]);
    setBarWidthsB([0, 0, 0, 0]);
    setValsA([0, 0, 0, 0]);
    setValsB([0, 0, 0, 0]);

    const timers: NodeJS.Timeout[] = [];

    // 1. Arc Sweep
    timers.push(
      setTimeout(() => {
        setArcOffset1(ARC * (1 - pct1 / 100));
        setArcOffset2(ARC * (1 - pct2 / 100));
        setSparkPos({ cx: px, cy: py });

        // Tween percentages
        const start = performance.now();
        const duration = 1800;
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setPercent1(Math.round(pct1 * eased));
          setPercent2(Math.round(pct2 * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 420)
    );

    // Shockwave burst at contact point
    timers.push(
      setTimeout(() => {
        setShockActive(true);
      }, 2150)
    );

    // Step 1: Center labels appear slowly one by one
    rows.forEach((_, idx) => {
      timers.push(
        setTimeout(() => {
          setLabelsVisible((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, 350 + idx * 340)
      );
    });

    // Step 2: After labels appear, BOTH colors sweep outward simultaneously & slowly!
    timers.push(
      setTimeout(() => {
        rows.forEach((r, idx) => {
          const rowMax = Math.max(r.a, r.b) * 1.06;
          const wA = Math.max(24, Math.round((r.a / rowMax) * 100));
          const wB = Math.max(24, Math.round((r.b / rowMax) * 100));

          setBarWidthsA((prev) => {
            const next = [...prev];
            next[idx] = wA;
            return next;
          });
          setBarWidthsB((prev) => {
            const next = [...prev];
            next[idx] = wB;
            return next;
          });

          // Tween numbers
          const start = performance.now();
          const duration = 1650;
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValsA((prev) => {
              const next = [...prev];
              next[idx] = Math.round(r.a * eased);
              return next;
            });
            setValsB((prev) => {
              const next = [...prev];
              next[idx] = Math.round(r.b * eased);
              return next;
            });
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, 1850)
    );

    return () => timers.forEach(clearTimeout);
  }, [duel, pct1, pct2, px, py]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-10 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.p1Color} height={130} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl space-y-5 relative z-10">
        {/* Top 3 Columns: Contender 1 Box | Clash Gauge | Contender 2 Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Contender 1 Card */}
          <div className="hud-card rounded-2xl p-4 border-l-4 border-l-violet-500 text-center md:text-left relative overflow-hidden gloss-bar">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              CONTENDER 01
            </div>
            <div className="font-hud text-2xl font-bold text-white mt-0.5 truncate">
              {duel.p1.name}
            </div>
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-violet-600/40 text-white font-hud font-bold text-[10px]">
                {duel.p1.tag}
              </span>
            </div>
          </div>

          {/* Center Semi-Circle Gauge */}
          <div className="relative flex flex-col items-center">
            <svg
              viewBox="0 0 360 195"
              className="w-full max-w-[300px] overflow-visible drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]"
            >
              {/* Radial Ticks */}
              {Array.from({ length: 25 }).map((_, i) => {
                const th = Math.PI * (1 - i / 24);
                const isMajor = i % 6 === 0;
                return (
                  <line
                    key={i}
                    x1={(CX + (R + 20) * Math.cos(th)).toFixed(1)}
                    y1={(CY - (R + 20) * Math.sin(th)).toFixed(1)}
                    x2={(CX + (R + (isMajor ? 30 : 25)) * Math.cos(th)).toFixed(1)}
                    y2={(CY - (R + (isMajor ? 30 : 25)) * Math.sin(th)).toFixed(1)}
                    stroke={isMajor ? '#fbbf24' : 'rgba(148,163,184,0.45)'}
                    strokeWidth={isMajor ? 2.5 : 1.5}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Background Track */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#0b0f19"
                strokeWidth="32"
              />

              {/* Arc 1 (Violet) */}
              <path
                className="arc-sweep"
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke={colors.p1Color}
                strokeWidth="24"
                style={{
                  strokeDasharray: ARC,
                  strokeDashoffset: arcOffset1,
                }}
              />

              {/* Energy Flow Line */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="5"
                className="energy-line"
              />

              {/* Arc 2 (Teal) */}
              <path
                className="arc-sweep"
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke={colors.p2Color}
                strokeWidth="24"
                style={{
                  strokeDasharray: ARC,
                  strokeDashoffset: arcOffset2,
                }}
              />

              {/* Scanner Needle */}
              <line
                x1="180"
                y1="170"
                x2="180"
                y2="26"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                className="scanner-run"
              />

              {/* Shockwave Burst */}
              {shockActive && (
                <circle
                  cx={px.toFixed(1)}
                  cy={py.toFixed(1)}
                  r="6"
                  fill="none"
                  stroke="#ffffff"
                  className="shock-run"
                />
              )}

              {/* Moving Contact Spark */}
              <circle
                cx={sparkPos.cx.toFixed(1)}
                cy={sparkPos.cy.toFixed(1)}
                r="7.5"
                fill="#ffffff"
                stroke="#090b10"
                strokeWidth="2"
                style={{
                  transition:
                    'cx 1.85s cubic-bezier(0.22,1.08,0.36,1), cy 1.85s cubic-bezier(0.22,1.08,0.36,1)',
                }}
              />
            </svg>

            {/* Percentage Comparison Center Badge */}
            <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
              <div className="px-4 py-1 rounded-lg bg-slate-950/95 border border-white/15 font-hud text-xl font-bold text-white shadow-xl">
                <span className="text-violet-400">{percent1}%</span>
                <span className="text-amber-400 text-xs mx-1.5">VS</span>
                <span className="text-teal-300">{percent2}%</span>
              </div>
            </div>
          </div>

          {/* Contender 2 Card */}
          <div className="hud-card rounded-2xl p-4 border-r-4 border-r-teal-400 text-center md:text-right relative overflow-hidden gloss-bar">
            <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
              CONTENDER 02
            </div>
            <div className="font-hud text-2xl font-bold text-white mt-0.5 truncate">
              {duel.p2.name}
            </div>
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-teal-600/40 text-white font-hud font-bold text-[10px]">
                {duel.p2.tag}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Comparison Stat Rows */}
        <div className="space-y-2.5 max-w-2xl mx-auto">
          {rows.map((r, idx) => (
            <div
              key={r.label}
              className="skew-box bg-slate-950/95 border border-white/15 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative flex items-center h-10 w-full">
                {/* Left Half: Expands OUTWARD from center toward left */}
                <div className="w-1/2 h-full flex justify-end overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-violet-500 to-violet-700 flex items-center justify-start pl-4 overflow-hidden"
                    style={{
                      width: `${barWidthsA[idx]}%`,
                      transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <span
                      className="unskew font-hud font-bold text-sm text-white"
                      style={{
                        opacity: barWidthsA[idx] > 0 ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                      }}
                    >
                      {valsA[idx].toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right Half: Expands OUTWARD from center toward right */}
                <div className="w-1/2 h-full flex justify-start overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-end pr-4 overflow-hidden"
                    style={{
                      width: `${barWidthsB[idx]}%`,
                      transition: 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <span
                      className="unskew font-hud font-bold text-sm text-slate-950 font-extrabold"
                      style={{
                        opacity: barWidthsB[idx] > 0 ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                      }}
                    >
                      {valsB[idx].toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Center Stat Label Pill: Appears FIRST slowly one by one */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="unskew px-3 py-0.5 rounded bg-slate-950 text-[10.5px] font-bold tracking-widest text-amber-300 border border-amber-400/40 shadow"
                    style={{
                      opacity: labelsVisible[idx] ? 1 : 0,
                      transform: labelsVisible[idx]
                        ? 'skewX(10deg) translateY(0) scale(1)'
                        : 'skewX(10deg) translateY(8px) scale(0.9)',
                      transition:
                        'opacity 0.55s ease, transform 0.6s cubic-bezier(0.22, 1.15, 0.36, 1)',
                    }}
                  >
                    {r.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
