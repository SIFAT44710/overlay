'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RadarContender {
  rank: number;
  name: string;
  tag: string;
  color: string;
  pts: number;
  kills: number;
  dmg: number;
  vals: number[]; // [KILLS, DAMAGE, HEADSHOTS, ASSIST, KNOCKDOWN]
}

const DEFAULT_TOP2: RadarContender[] = [
  {
    rank: 2,
    name: 'EXE',
    tag: 'EXE',
    color: '#A78BFA',
    pts: 98,
    kills: 76,
    dmg: 42349,
    vals: [81, 74, 75, 55, 71],
  },
  {
    rank: 1,
    name: 'TOP',
    tag: 'TOP',
    color: '#E11D48',
    pts: 134,
    kills: 94,
    dmg: 57261,
    vals: [100, 100, 100, 100, 100],
  },
];

const AXES = ['KILLS', 'DAMAGE', 'HEADSHOTS', 'ASSIST', 'KNOCKDOWN'];

const DEFAULT_COLORS = {
  rank1Color: '#E11D48',
  rank2Color: '#A78BFA',
  fireColor: '#E11D48',
};

export default function Dashboard12({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [step, setStep] = useState(0); // 0=init, 1=rings, 2=spokes, 3=team2, 4=team1
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard12) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard12 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard12');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  // Derive dynamic top 2 from sheet data
  const top2: RadarContender[] = React.useMemo(() => {
    const list = dayData?.standing || sheetData?.data || [];
    if (list.length >= 2) {
      const t1 = list[0];
      const t2 = list[1];
      const t1Tag = t1.tag || (t1.TeamName ? t1.TeamName.slice(0, 3).toUpperCase() : 'TOP');
      const t2Tag = t2.tag || (t2.TeamName ? t2.TeamName.slice(0, 3).toUpperCase() : 'EXE');
      const t1Pts = parseInt(t1.total ?? t1.Total ?? 134, 10);
      const t2Pts = parseInt(t2.total ?? t2.Total ?? 98, 10);
      const t1K = parseInt(t1.elims ?? t1.Kill ?? 94, 10);
      const t2K = parseInt(t2.elims ?? t2.Kill ?? 76, 10);
      const t1D = parseInt(t1.damage ?? t1.Damage ?? 57261, 10);
      const t2D = parseInt(t2.damage ?? t2.Damage ?? 42349, 10);

      const kRatio = Math.min(100, Math.round((t2K / Math.max(1, t1K)) * 100));
      const dRatio = Math.min(100, Math.round((t2D / Math.max(1, t1D)) * 100));

      return [
        {
          rank: 2,
          name: t2Tag,
          tag: t2Tag,
          color: colors.rank2Color || '#A78BFA',
          pts: t2Pts,
          kills: t2K,
          dmg: t2D,
          vals: [kRatio, dRatio, 75, 55, 71],
        },
        {
          rank: 1,
          name: t1Tag,
          tag: t1Tag,
          color: colors.rank1Color || '#E11D48',
          pts: t1Pts,
          kills: t1K,
          dmg: t1D,
          vals: [100, 100, 100, 100, 100],
        },
      ];
    }
    return DEFAULT_TOP2;
  }, [dayData, sheetData, colors.rank1Color, colors.rank2Color]);

  // Cinematic sequential progression timing
  useEffect(() => {
    // 1. Rings scale in
    const t1 = setTimeout(() => setStep(1), 120);
    // 2. Axis text appears
    const t2 = setTimeout(() => setStep(2), 700);
    // 3. Team #2 enters dramatically
    const t3 = setTimeout(() => setStep(3), 1950);
    // 4. Team #1 sweeps out slowly
    const t4 = setTimeout(() => setStep(4), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const CX = 210;
  const CY = 195;
  const maxR = 128;

  const ptAt = (axisIdx: number, pct: number) => {
    const ang = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 5;
    const r = maxR * (pct / 100);
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  };

  const polyStr = (vals: number[]) =>
    vals.map((v, i) => ptAt(i, v).map((n) => n.toFixed(1)).join(',')).join(' ');

  const bannerText =
    step >= 4
      ? `RANK #1 — ${top2[1].tag} (${top2[1].pts} PTS)`
      : step >= 3
      ? `RANK #2 — ${top2[0].tag} (${top2[0].pts} PTS)`
      : 'CINEMATIC RADAR ANALYSIS';

  const bannerBg =
    step >= 4
      ? colors.rank1Color
      : step >= 3
      ? colors.rank2Color
      : 'rgba(255,255,255,0.1)';

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Background Fire Flame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || colors.rank1Color} height={480} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Dynamic Animated Status Banner */}
        <div className="h-9 mb-2 flex items-center justify-center">
          <span
            className="px-5 py-1.5 rounded-full font-hud text-xs font-black text-white tracking-widest uppercase shadow-xl transition-all duration-700 border border-black/40"
            style={{
              backgroundColor: bannerBg,
              opacity: step >= 1 ? 1 : 0,
              transform: step >= 1 ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            {bannerText}
          </span>
        </div>

        {/* Radar SVG Stage */}
        <div className="relative w-full max-w-[440px] flex items-center justify-center">
          <svg viewBox="0 0 420 390" className="w-full overflow-visible">
            {/* Concentric Rings */}
            {[25, 50, 75, 100].map((p, idx) => (
              <polygon
                key={p}
                points={polyStr([p, p, p, p, p])}
                fill="none"
                stroke={p === 100 ? 'rgba(226,232,240,0.55)' : 'rgba(226,232,240,0.22)'}
                strokeWidth={p === 100 ? 2 : 1.2}
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform: step >= 1 ? 'scale(1)' : 'scale(0)',
                  opacity: step >= 1 ? 1 : 0,
                  transition: `transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.18}s, opacity 0.6s ease`,
                }}
              />
            ))}

            {/* Spokes & Axis Labels */}
            {AXES.map((lbl, i) => {
              const [x2, y2] = ptAt(i, 100);
              const [lx, ly] = ptAt(i, 126);
              return (
                <g key={lbl}>
                  <line
                    x1={CX}
                    y1={CY}
                    x2={x2.toFixed(1)}
                    y2={y2.toFixed(1)}
                    stroke="rgba(226,232,240,0.22)"
                  />
                  <text
                    x={lx.toFixed(1)}
                    y={(ly + 4).toFixed(1)}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12.5"
                    fontWeight="800"
                    className="font-hud"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#090b10',
                      strokeWidth: '4px',
                      opacity: step >= 2 ? 1 : 0,
                      transition: `opacity 0.65s ease ${i * 0.12}s`,
                    }}
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

            {/* Team #2 (EXE) Shape */}
            <g
              className="cursor-pointer transition-all duration-[1900ms]"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: step >= 3 ? 'scale(1)' : 'scale(0)',
                opacity: step >= 3 ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.16, 1.12, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  text: `#2 ${top2[0].tag} — ${top2[0].pts} PTS (${top2[0].kills} Kills • ${top2[0].dmg.toLocaleString()} DMG)`,
                });
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <polygon
                points={polyStr(top2[0].vals)}
                fill={`${top2[0].color}38`}
                stroke={top2[0].color}
                strokeWidth="3.5"
              />
              {top2[0].vals.map((v, ai) => {
                const [dx, dy] = ptAt(ai, v);
                return (
                  <circle
                    key={ai}
                    cx={dx.toFixed(1)}
                    cy={dy.toFixed(1)}
                    r="5"
                    fill={top2[0].color}
                    stroke="#000"
                    strokeWidth="2"
                  />
                );
              })}
            </g>

            {/* Team #1 (TOP) Shape */}
            <g
              className="cursor-pointer transition-all duration-[1900ms]"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: step >= 4 ? 'scale(1)' : 'scale(0)',
                opacity: step >= 4 ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.16, 1.12, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  text: `#1 ${top2[1].tag} — ${top2[1].pts} PTS (${top2[1].kills} Kills • ${top2[1].dmg.toLocaleString()} DMG)`,
                });
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <polygon
                points={polyStr(top2[1].vals)}
                fill={`${top2[1].color}38`}
                stroke={top2[1].color}
                strokeWidth="3.5"
              />
              {top2[1].vals.map((v, ai) => {
                const [dx, dy] = ptAt(ai, v);
                return (
                  <circle
                    key={ai}
                    cx={dx.toFixed(1)}
                    cy={dy.toFixed(1)}
                    r="5"
                    fill={top2[1].color}
                    stroke="#000"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          </svg>
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
