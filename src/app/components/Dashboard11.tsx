'use client';

import React, { useState, useEffect } from 'react';
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

const DEFAULT_DUEL = {
  p1: { name: 'TOP.1SHOVO', team: 'RAAD VAI YT', tag: 'TOP', kills: 29, damage: 11859, hs: 31, assist: 22 },
  p2: { name: 'EXE.SEJAN', team: 'EXTREME EX', tag: 'EXE', kills: 27, damage: 11890, hs: 22, assist: 13 },
};

const DEFAULT_COLORS = {
  p1Plate: '#ffffff',
  p2Plate: '#6225A6',
  gaugeDark: '#111827',
  gaugePurple: '#6225A6',
  accentGold: '#F5B700',
  labelColor: '#6225A6',
};

export default function Dashboard11({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [arcOffset1, setArcOffset1] = useState(Math.PI * 125);
  const [arcOffset2, setArcOffset2] = useState(Math.PI * 125);
  const [dotPos, setDotPos] = useState({ cx: 55, cy: 170 });
  const [percent1, setPercent1] = useState(0);
  const [percent2, setPercent2] = useState(0);
  const [shockActive, setShockActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [barWidths, setBarWidths] = useState<number[]>([50, 50, 50, 50]);
  const [valsA, setValsA] = useState<number[]>([0, 0, 0, 0]);
  const [valsB, setValsB] = useState<number[]>([0, 0, 0, 0]);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet4', fetcher, { refreshInterval: 5000 });

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

  const duel = React.useMemo(() => {
    const raw = sheetData?.data || [];
    if (raw.length >= 2) {
      const p1 = raw[0];
      const p2 = raw[1];
      return {
        p1: {
          name: p1.PlayerName || p1.Name || DEFAULT_DUEL.p1.name,
          team: p1.TeamName || DEFAULT_DUEL.p1.team,
          tag: (p1.TeamName || 'TOP').slice(0, 3).toUpperCase(),
          kills: parseInt(p1.Kill || p1.Kills, 10) || DEFAULT_DUEL.p1.kills,
          damage: parseInt(p1.Damage, 10) || DEFAULT_DUEL.p1.damage,
          hs: parseInt(p1.Headshots || p1.HS, 10) || DEFAULT_DUEL.p1.hs,
          assist: parseInt(p1.Assist || p1.Assists, 10) || DEFAULT_DUEL.p1.assist,
        },
        p2: {
          name: p2.PlayerName || p2.Name || DEFAULT_DUEL.p2.name,
          team: p2.TeamName || DEFAULT_DUEL.p2.team,
          tag: (p2.TeamName || 'EXE').slice(0, 3).toUpperCase(),
          kills: parseInt(p2.Kill || p2.Kills, 10) || DEFAULT_DUEL.p2.kills,
          damage: parseInt(p2.Damage, 10) || DEFAULT_DUEL.p2.damage,
          hs: parseInt(p2.Headshots || p2.HS, 10) || DEFAULT_DUEL.p2.hs,
          assist: parseInt(p2.Assist || p2.Assists, 10) || DEFAULT_DUEL.p2.assist,
        },
      };
    }
    return DEFAULT_DUEL;
  }, [sheetData]);

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

  // Radial ticks
  const ticks = React.useMemo(() => {
    const list = [];
    for (let i = 0; i <= 24; i++) {
      const th = Math.PI * (1 - i / 24);
      const isMajor = i % 6 === 0;
      const x1 = (CX + (R + 20) * Math.cos(th)).toFixed(1);
      const y1 = (CY - (R + 20) * Math.sin(th)).toFixed(1);
      const x2 = (CX + (R + (isMajor ? 30 : 25)) * Math.cos(th)).toFixed(1);
      const y2 = (CY - (R + (isMajor ? 30 : 25)) * Math.sin(th)).toFixed(1);
      list.push({
        x1,
        y1,
        x2,
        y2,
        stroke: isMajor ? colors.accentGold : 'rgba(0,0,0,0.35)',
        strokeWidth: isMajor ? 2.5 : 1.5,
      });
    }
    return list;
  }, [colors.accentGold]);

  const rows = [
    { label: 'ELIMS', a: duel.p1.kills, b: duel.p2.kills },
    { label: 'DAMAGE', a: duel.p1.damage, b: duel.p2.damage },
    { label: 'ASSISTS', a: duel.p1.assist, b: duel.p2.assist },
    { label: 'HEADSHOTS', a: duel.p1.hs, b: duel.p2.hs },
  ];

  useEffect(() => {
    // Reset
    setArcOffset1(ARC);
    setArcOffset2(ARC);
    setDotPos({ cx: 55, cy: 170 });
    setPercent1(0);
    setPercent2(0);
    setShockActive(false);
    setBarWidths([50, 50, 50, 50]);
    setValsA([0, 0, 0, 0]);
    setValsB([0, 0, 0, 0]);

    const timers: NodeJS.Timeout[] = [];

    // Arc Sweep & Numbers
    timers.push(
      setTimeout(() => {
        setArcOffset1(ARC * (1 - pct1 / 100));
        setArcOffset2(ARC * (1 - pct2 / 100));
        setDotPos({ cx: px, cy: py });

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

    // Shockwave & Sparks at contact point
    timers.push(
      setTimeout(() => {
        setShockActive(true);
        const sparkColors = ['#FFFBEB', '#FFD700', '#F5B700', '#EC008C', '#7C3AED', '#6225A6'];
        const list: Spark[] = [];
        for (let i = 0; i < 28; i++) {
          const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.4;
          const dist = 28 + Math.random() * 60;
          list.push({
            cx: px,
            cy: py,
            r: 2 + Math.random() * 3.5,
            fill: sparkColors[i % sparkColors.length],
            tx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
            ty: `${(Math.sin(angle) * dist - 8).toFixed(1)}px`,
            dur: `${(0.65 + Math.random() * 0.5).toFixed(2)}s`,
          });
        }
        setSparks(list);
      }, 2120)
    );

    // Slanted 50/50 -> Ratio Comparison Bars
    rows.forEach((r, i) => {
      const pA = Math.round((r.a / (r.a + r.b)) * 100) || 50;
      timers.push(
        setTimeout(() => {
          setBarWidths((prev) => {
            const next = [...prev];
            next[i] = pA;
            return next;
          });

          // Tween numbers
          const start = performance.now();
          const duration = 1400;
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValsA((prev) => {
              const next = [...prev];
              next[i] = Math.round(r.a * eased);
              return next;
            });
            setValsB((prev) => {
              const next = [...prev];
              next[i] = Math.round(r.b * eased);
              return next;
            });
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, 680 + i * 210)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [duel, pct1, pct2, px, py]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 sm:p-6 bg-transparent select-none">
      <div className="w-full max-w-4xl space-y-6">
        {/* Top 3 Columns: Player 1 Box | Clash Gauge | Player 2 Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Player 1 Box (White plate, black border & shadow) */}
          <div
            className="px-5 py-3.5 text-center md:text-left transition shadow"
            style={{
              backgroundColor: colors.p1Plate,
              border: '2.5px solid #000000',
              boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div className="font-title text-2xl sm:text-3xl font-bold text-black leading-none truncate">
              {duel.p1.name}
            </div>
            <div
              className="text-xs font-extrabold mt-1 tracking-wider"
              style={{ color: colors.labelColor }}
            >
              {duel.p1.team}
            </div>
          </div>

          {/* Center Semi-Circle Clash Gauge */}
          <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 360 195" className="w-full max-w-[320px] overflow-visible">
              {ticks.map((t, idx) => (
                <line
                  key={idx}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.stroke}
                  strokeWidth={t.strokeWidth}
                  strokeLinecap="round"
                />
              ))}

              {/* Background Arc */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(0,0,0,0.14)"
                strokeWidth="30"
              />

              {/* Player 1 Arc (Left) */}
              <path
                className="arc-sweep"
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke={colors.gaugeDark}
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={arcOffset1}
              />

              {/* Energy Flow Pulse */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(245,183,0,0.45)"
                strokeWidth="5"
                className="energy-line"
              />

              {/* Player 2 Arc (Right) */}
              <path
                className="arc-sweep"
                d="M 305 170 A 125 125 0 0 0 55 170"
                fill="none"
                stroke={colors.gaugePurple}
                strokeWidth="24"
                strokeDasharray={ARC}
                strokeDashoffset={arcOffset2}
              />

              {/* Scanner Line */}
              <line
                x1="180"
                y1="170"
                x2="180"
                y2="24"
                stroke={colors.accentGold}
                strokeWidth="3"
                strokeLinecap="round"
                className="scanner-run"
              />

              {/* Shockwave at contact point */}
              <circle
                cx={px.toFixed(1)}
                cy={py.toFixed(1)}
                r="6"
                fill="none"
                stroke={colors.accentGold}
                className={shockActive ? 'shock-run' : ''}
                style={{ opacity: shockActive ? 1 : 0 }}
              />

              {/* Sparks Explosion */}
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

              {/* Gold Contact Dot */}
              <circle
                cx={dotPos.cx.toFixed(1)}
                cy={dotPos.cy.toFixed(1)}
                r="7.5"
                fill={colors.accentGold}
                stroke="#000000"
                strokeWidth="2.5"
                style={{
                  transition:
                    'cx 1.8s cubic-bezier(0.22, 1.08, 0.36, 1), cy 1.8s cubic-bezier(0.22, 1.08, 0.36, 1)',
                }}
              />
            </svg>

            {/* Percentages */}
            <div className="absolute inset-x-0 bottom-1 flex justify-center font-num text-2xl font-extrabold">
              <span className="text-black">{percent1}%</span>
              <span
                className="text-xs mx-2 self-center px-2 py-0.5 rounded font-black tracking-wider text-black border border-black shadow-[2px_2px_0px_#000]"
                style={{ backgroundColor: colors.accentGold }}
              >
                VS
              </span>
              <span style={{ color: colors.gaugePurple }}>{percent2}%</span>
            </div>
          </div>

          {/* Player 2 Box (Purple plate, black border & shadow) */}
          <div
            className="px-5 py-3.5 text-center md:text-right transition shadow"
            style={{
              backgroundColor: colors.p2Plate,
              border: '2.5px solid #000000',
              boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div className="font-title text-2xl sm:text-3xl font-bold text-white leading-none truncate">
              {duel.p2.name}
            </div>
            <div
              className="text-xs font-extrabold mt-1 tracking-wider"
              style={{ color: colors.accentGold }}
            >
              {duel.p2.team}
            </div>
          </div>
        </div>

        {/* 4 Slanted 50/50 -> Ratio Comparison Bars */}
        <div className="space-y-3.5 max-w-2xl mx-auto">
          {rows.map((r, i) => (
            <div
              key={i}
              className="skew-box border-2 border-black overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.75)]"
            >
              <div className="relative flex items-center h-9 w-full">
                {/* Left Side (Dark) */}
                <div
                  className="bar-x h-full flex items-center pl-4"
                  style={{
                    width: `${barWidths[i]}%`,
                    backgroundColor: colors.gaugeDark,
                  }}
                >
                  <span className="unskew font-num font-bold text-sm text-white">
                    {valsA[i].toLocaleString()}
                  </span>
                </div>

                {/* Right Side (Purple) */}
                <div
                  className="bar-x h-full flex items-center justify-end pr-4"
                  style={{
                    width: `${100 - barWidths[i]}%`,
                    backgroundColor: colors.gaugePurple,
                  }}
                >
                  <span className="unskew font-num font-bold text-sm text-white">
                    {valsB[i].toLocaleString()}
                  </span>
                </div>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="unskew px-2.5 py-0.5 rounded bg-black font-num text-[10px] font-bold border border-white/20"
                    style={{ color: colors.accentGold }}
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
