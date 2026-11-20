'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MATCH_LABELS = ['M1', 'M2', 'M3', 'M4', 'M5'];

const DEFAULT_LINE_DATA = {
  kills: [114, 102, 97, 129, 114],
  damage: [74334, 67724, 60618, 75983, 71677],
};

const DEFAULT_COLORS = {
  killsColor: '#F5B700',
  damageColor: '#38BDF8',
  fireColor: '#8B5CF6',
  cardBg: 'rgba(9, 11, 18, 0.75)',
};

export default function Dashboard13({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animated, setAnimated] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    match: string;
    kills: number;
    damage: number;
  } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard13) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard13 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard13');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Compute live match points if sheet provides multiple matches or fallback
  const lineData = React.useMemo(() => {
    if (sheetData?.history && Array.isArray(sheetData.history) && sheetData.history.length >= 2) {
      const k = sheetData.history.map((m: any) => m.kills || 100);
      const d = sheetData.history.map((m: any) => m.damage || 70000);
      return { kills: k, damage: d };
    }
    return DEFAULT_LINE_DATA;
  }, [sheetData]);

  // Dimensions for SVG Line Chart
  const W = 800;
  const H = 340;
  const PAD_X = 70;
  const PAD_TOP = 40;
  const PAD_BOTTOM = 50;
  const PLOT_W = W - PAD_X * 2;
  const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

  const minKills = 80;
  const maxKills = 145;
  const minDmg = 50000;
  const maxDmg = 85000;

  const getKillsY = (v: number) =>
    PAD_TOP + PLOT_H * (1 - (v - minKills) / (maxKills - minKills));
  const getDmgY = (v: number) =>
    PAD_TOP + PLOT_H * (1 - (v - minDmg) / (maxDmg - minDmg));
  const getX = (idx: number) =>
    PAD_X + (idx / (MATCH_LABELS.length - 1)) * PLOT_W;

  // Build SVG path with Catmull-Rom or cubic spline
  const buildSmoothPath = (pts: [number, number][]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };

  const killPts: [number, number][] = lineData.kills.map((v: number, i: number) => [
    getX(i),
    getKillsY(v),
  ]);
  const dmgPts: [number, number][] = lineData.damage.map((v: number, i: number) => [
    getX(i),
    getDmgY(v),
  ]);

  const killLinePath = buildSmoothPath(killPts);
  const dmgLinePath = buildSmoothPath(dmgPts);

  const killAreaPath = `${killLinePath} L ${getX(MATCH_LABELS.length - 1)} ${
    PAD_TOP + PLOT_H
  } L ${getX(0)} ${PAD_TOP + PLOT_H} Z`;
  const dmgAreaPath = `${dmgLinePath} L ${getX(MATCH_LABELS.length - 1)} ${
    PAD_TOP + PLOT_H
  } L ${getX(0)} ${PAD_TOP + PLOT_H} Z`;

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Dynamic Background Flame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || '#8B5CF6'} height={480} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Header Badges */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <span
              className="px-4 py-1 rounded-full font-hud text-xs font-black text-black tracking-widest uppercase shadow-lg"
              style={{ backgroundColor: colors.killsColor }}
            >
              TOTAL KILLS (L)
            </span>
            <span
              className="px-4 py-1 rounded-full font-hud text-xs font-black text-black tracking-widest uppercase shadow-lg"
              style={{ backgroundColor: colors.damageColor }}
            >
              TOTAL DAMAGE (R)
            </span>
          </div>

          <span className="font-hud text-xs font-bold text-slate-400 tracking-wider">
            MATCH 1–5 PROGRESSION
          </span>
        </div>

        {/* Chart Canvas Card */}
        <div
          className="relative w-full rounded-2xl p-6 backdrop-blur-md border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: 'rgba(148, 163, 184, 0.2)',
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
            <defs>
              {/* Kills Gradient Fill */}
              <linearGradient id="kill-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.killsColor} stopOpacity="0.32" />
                <stop offset="100%" stopColor={colors.killsColor} stopOpacity="0.0" />
              </linearGradient>

              {/* Damage Gradient Fill */}
              <linearGradient id="dmg-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.damageColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={colors.damageColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = PAD_TOP + PLOT_H * p;
              const kVal = Math.round(maxKills - p * (maxKills - minKills));
              const dVal = Math.round(maxDmg - p * (maxDmg - minDmg));
              return (
                <g key={i}>
                  <line
                    x1={PAD_X}
                    y1={y}
                    x2={W - PAD_X}
                    y2={y}
                    stroke="rgba(226, 232, 240, 0.12)"
                    strokeDasharray="4 4"
                  />
                  {/* Left Axis Tick (Kills) */}
                  <text
                    x={PAD_X - 12}
                    y={y + 4}
                    textAnchor="end"
                    fill={colors.killsColor}
                    fontSize="11"
                    fontWeight="800"
                    className="font-hud"
                  >
                    {kVal}
                  </text>
                  {/* Right Axis Tick (Damage) */}
                  <text
                    x={W - PAD_X + 12}
                    y={y + 4}
                    textAnchor="start"
                    fill={colors.damageColor}
                    fontSize="11"
                    fontWeight="800"
                    className="font-hud"
                  >
                    {dVal.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            <path
              d={dmgAreaPath}
              fill="url(#dmg-fill)"
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 1.2s ease 0.3s',
              }}
            />
            <path
              d={killAreaPath}
              fill="url(#kill-fill)"
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 1.2s ease',
              }}
            />

            {/* Damage Line (Sky Blue) */}
            <path
              d={dmgLinePath}
              fill="none"
              stroke={colors.damageColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              className={animated ? 'draw-line' : ''}
              style={{
                strokeDasharray: 2000,
                strokeDashoffset: animated ? 0 : 2000,
                transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Kills Line (Gold) */}
            <path
              d={killLinePath}
              fill="none"
              stroke={colors.killsColor}
              strokeWidth="4"
              strokeLinecap="round"
              className={animated ? 'draw-line' : ''}
              style={{
                strokeDasharray: 2000,
                strokeDashoffset: animated ? 0 : 2000,
                transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            />

            {/* Interactive Data Nodes */}
            {MATCH_LABELS.map((m, idx) => {
              const [kx, ky] = killPts[idx];
              const [dx, dy] = dmgPts[idx];
              const kVal = lineData.kills[idx];
              const dVal = lineData.damage[idx];

              return (
                <g key={m}>
                  {/* Bottom X Label */}
                  <text
                    x={kx}
                    y={H - 14}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="13"
                    fontWeight="900"
                    className="font-hud"
                  >
                    {m}
                  </text>

                  {/* Damage Node */}
                  <circle
                    cx={dx}
                    cy={dy}
                    r="6"
                    fill={colors.damageColor}
                    stroke="#090b10"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setHoveredPoint({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        match: m,
                        kills: kVal,
                        damage: dVal,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Kills Node */}
                  <circle
                    cx={kx}
                    cy={ky}
                    r="6.5"
                    fill={colors.killsColor}
                    stroke="#090b10"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setHoveredPoint({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        match: m,
                        kills: kVal,
                        damage: dVal,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Point Tooltip */}
      {hoveredPoint && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 rounded-xl bg-slate-900/95 border border-white/20 text-white font-hud text-xs font-bold shadow-2xl -translate-x-1/2 -translate-y-full"
          style={{ left: hoveredPoint.x, top: hoveredPoint.y - 12 }}
        >
          <div className="text-[10px] text-slate-400 font-extrabold uppercase">
            MATCH {hoveredPoint.match}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span style={{ color: colors.killsColor }}>{hoveredPoint.kills} Kills</span>
            <span style={{ color: colors.damageColor }}>
              {hoveredPoint.damage.toLocaleString()} DMG
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
