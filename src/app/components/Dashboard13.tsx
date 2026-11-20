'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MATCH_LABELS = ['M1', 'M2', 'M3', 'M4', 'M5'];

const DEFAULT_LINE_DATA = {
  kills: [114, 102, 97, 129, 114],
  damage: [74334, 67724, 60618, 75983, 71677],
};

export default function Dashboard13({ overrideColors }: { overrideColors?: any } = {}) {
  const [animated, setAnimated] = useState(false);
  const [fireActive, setFireActive] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const lineData = React.useMemo(() => {
    if (sheetData?.history && Array.isArray(sheetData.history) && sheetData.history.length >= 2) {
      const k = sheetData.history.map((m: any) => m.kills || 100);
      const d = sheetData.history.map((m: any) => m.damage || 70000);
      return { kills: k, damage: d };
    }
    return DEFAULT_LINE_DATA;
  }, [sheetData]);

  useEffect(() => {
    const tAnim = setTimeout(() => setAnimated(true), 200);
    const tFire = setTimeout(() => setFireActive(true), 500);
    return () => {
      clearTimeout(tAnim);
      clearTimeout(tFire);
    };
  }, []);

  const W = 820;
  const H = 340;
  const PAD_X = 65;
  const PAD_TOP = 40;
  const PAD_BOTTOM = 55;
  const PLOT_W = W - PAD_X * 2;
  const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

  const minK = 80;
  const maxK = 145;
  const minD = 50000;
  const maxD = 85000;

  const getKillsY = (v: number) =>
    PAD_TOP + PLOT_H * (1 - (v - minK) / (maxK - minK));
  const getDmgY = (v: number) =>
    PAD_TOP + PLOT_H * (1 - (v - minD) / (maxD - minD));
  const getX = (idx: number) =>
    PAD_X + (idx / (MATCH_LABELS.length - 1)) * PLOT_W;

  const killsPts: [number, number][] = lineData.kills.map((k: number, i: number) => [getX(i), getKillsY(k)]);
  const dmgPts: [number, number][] = lineData.damage.map((d: number, i: number) => [getX(i), getDmgY(d)]);

  const buildSpline = (pts: [number, number][]) => {
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

  const killsPath = buildSpline(killsPts);
  const dmgPath = buildSpline(dmgPts);

  const killsArea = `${killsPath} L ${getX(MATCH_LABELS.length - 1)} ${PAD_TOP + PLOT_H} L ${getX(0)} ${PAD_TOP + PLOT_H} Z`;
  const dmgArea = `${dmgPath} L ${getX(MATCH_LABELS.length - 1)} ${PAD_TOP + PLOT_H} L ${getX(0)} ${PAD_TOP + PLOT_H} Z`;

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-3">
        {/* Peak Match Top Pill */}
        <div className="flex justify-center">
          <div
            className={`transition-all duration-500 px-4 py-1.5 rounded-xl bg-transparent border border-purple-400 font-hud text-xs sm:text-sm font-extrabold text-white flex items-center gap-2.5 relative ${
              fireActive ? 'top1-hero-glow top1-scale opacity-100' : 'opacity-0'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {fireActive && (
              <div
                className="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 opacity-100"
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10 text-amber-400">#1 PEAK MATCH • M4</span>
            <span className="relative z-10 text-amber-300">129 KILLS</span>
            <span className="relative z-10 text-slate-500">|</span>
            <span className="relative z-10 text-sky-300">75,983 DMG</span>
          </div>
        </div>

        {/* Dual Line SVG Chart */}
        <div className="hud-card rounded-2xl p-4 sm:p-6 relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="killsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5B700" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F5B700" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="dmgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = PAD_TOP + PLOT_H * pct;
              const kVal = Math.round(maxK - pct * (maxK - minK));
              const dVal = Math.round(maxD - pct * (maxD - minD));
              return (
                <g key={i}>
                  <line
                    x1={PAD_X}
                    y1={y}
                    x2={W - PAD_X}
                    y2={y}
                    stroke="rgba(148,163,184,0.18)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PAD_X - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#F5B700"
                    fontSize="10"
                    fontWeight="700"
                    className="font-hud"
                  >
                    {kVal}
                  </text>
                  <text
                    x={W - PAD_X + 10}
                    y={y + 4}
                    textAnchor="start"
                    fill="#38BDF8"
                    fontSize="10"
                    fontWeight="700"
                    className="font-hud"
                  >
                    {(dVal / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            <path
              d={killsArea}
              fill="url(#killsGrad)"
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 1.5s ease',
              }}
            />
            <path
              d={dmgArea}
              fill="url(#dmgGrad)"
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 1.5s ease',
              }}
            />

            {/* Main Lines */}
            <path
              d={killsPath}
              fill="none"
              stroke="#F5B700"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="draw-line"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(245,183,0,0.6))',
                opacity: animated ? 1 : 0,
                transition: 'opacity 1s ease',
              }}
            />
            <path
              d={killsPath}
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.5"
              className="wire-flow"
            />

            <path
              d={dmgPath}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="draw-line"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.6))',
                opacity: animated ? 1 : 0,
                transition: 'opacity 1s ease',
              }}
            />
            <path
              d={dmgPath}
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="2.5"
              className="wire-flow"
              style={{ animationDelay: '1.2s' }}
            />

            {/* X Axis Labels */}
            {MATCH_LABELS.map((lbl, i) => {
              const x = getX(i);
              return (
                <g key={lbl}>
                  <rect
                    x={x - 22}
                    y={H - 32}
                    width="44"
                    height="20"
                    rx="5"
                    fill="rgba(88,28,135,0.28)"
                    stroke="rgba(192,132,252,0.45)"
                  />
                  <text
                    x={x}
                    y={H - 18}
                    textAnchor="middle"
                    fill="#2dd4bf"
                    fontSize="11"
                    fontWeight="700"
                    className="font-hud"
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

            {/* Data Points */}
            {MATCH_LABELS.map((_, i) => {
              const [kx, ky] = killsPts[i];
              const [dx, dy] = dmgPts[i];
              const isHovered = hoveredIdx === i;

              return (
                <g key={i}>
                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={kx}
                      y1={PAD_TOP}
                      x2={kx}
                      y2={PAD_TOP + PLOT_H}
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Kills Point */}
                  <circle
                    cx={kx}
                    cy={ky}
                    r={isHovered ? 7.5 : 5.5}
                    fill="#F5B700"
                    stroke="#090b10"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Damage Point */}
                  <circle
                    cx={dx}
                    cy={dy}
                    r={isHovered ? 7.5 : 5.5}
                    fill="#38BDF8"
                    stroke="#090b10"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Readout */}
          {hoveredIdx !== null && (
            <div className="absolute top-4 right-6 px-3.5 py-1.5 rounded-lg bg-slate-950/95 border border-purple-400/40 text-white font-hud text-xs shadow-xl pointer-events-none">
              <span className="text-amber-400 font-bold mr-2">
                {MATCH_LABELS[hoveredIdx]}:
              </span>
              <span className="text-amber-300 font-extrabold mr-2">
                {lineData.kills[hoveredIdx]} KILLS
              </span>
              <span className="text-sky-300 font-extrabold">
                {lineData.damage[hoveredIdx].toLocaleString()} DMG
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
