'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { startRealFireCanvas } from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProgressionTeam {
  tag: string;
  name: string;
  color: string;
  pts: number[];
}

const DEFAULT_PROGRESSION: ProgressionTeam[] = [
  { tag: 'TOP', name: 'RAAD VAI YT',       color: '#fbbf24', pts: [21, 67, 81, 104, 134] },
  { tag: 'EXE', name: 'EXTREME EX',        color: '#a78bfa', pts: [29, 34, 55, 73, 98] },
  { tag: 'S9x', name: 'SNEAKY9X',          color: '#2dd4bf', pts: [29, 31, 62, 93, 96] },
  { tag: 'CME', name: 'COFFIN MAKERS ESP', color: '#f43f5e', pts: [14, 34, 56, 69, 93] },
  { tag: 'TRX', name: 'TITANOVA REX',      color: '#38bdf8', pts: [12, 27, 41, 67, 85] },
];

function spreadY(
  items: { y: number }[],
  minGap: number,
  minY: number,
  maxY: number
): number[] {
  const sorted = items
    .map((it, idx) => ({ ...it, origIdx: idx, ly: it.y }))
    .sort((a, b) => a.ly - b.ly);
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i].ly - sorted[i - 1].ly;
      if (diff < minGap) {
        const push = (minGap - diff) / 2;
        sorted[i - 1].ly -= push;
        sorted[i].ly += push;
      }
    }
    sorted.forEach((s) => {
      s.ly = Math.max(minY, Math.min(maxY, s.ly));
    });
  }
  const out = new Array(items.length);
  sorted.forEach((s) => {
    out[s.origIdx] = s.ly;
  });
  return out;
}

export default function Dashboard2({ overrideColors }: { overrideColors?: any } = {}) {
  const [animStep, setAnimStep] = useState(0);
  const [topFireActive, setTopFireActive] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    tIdx: number;
    mIdx: number;
    x: number;
    y: number;
  } | null>(null);

  const pillCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });
  const teams: ProgressionTeam[] = (sheetData?.matchProgression && sheetData.matchProgression.length > 0)
    ? sheetData.matchProgression
    : DEFAULT_PROGRESSION;

  const maxVal = Math.max(140, ...teams.flatMap((t) => t.pts));

  const W = 920;
  const H = 370;
  const padL = 62;
  const padR = 165;
  const padT = 32;
  const padB = 48;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  const safeYs = spreadY(
    teams.map((t) => ({ y: padT + cH - (((t.pts[4] ?? t.pts[t.pts.length - 1] ?? 0)) / maxVal) * cH })),
    36,
    padT + 14,
    H - padB - 14
  );

  useEffect(() => {
    const t1 = setTimeout(() => setAnimStep(1), 160);
    const t2 = setTimeout(() => setAnimStep(2), 1450);
    const tPill = setTimeout(() => {
      setTopFireActive(true);
      if (pillCanvasRef.current) {
        startRealFireCanvas(pillCanvasRef.current, { light: true });
      }
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tPill);
    };
  }, []);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-5xl relative">
        {/* Top 1 Leader Pill */}
        <div className="flex justify-center mb-2">
          <div
            className={`transition-all duration-500 px-4 py-1.5 rounded-xl bg-transparent border border-purple-400/70 font-hud text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 relative ${
              topFireActive ? 'opacity-100 top1-hero-glow top1-scale' : 'opacity-0'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {/* Real spirit flame behind pill */}
            <div
              className="pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500"
              style={{ zIndex: -1, opacity: topFireActive ? 1 : 0 }}
            >
              <canvas ref={pillCanvasRef} className="w-full h-full block" />
            </div>

            <span className="text-amber-400">#1 LEADER</span>
            <span>{teams[0]?.name || 'RAAD VAI YT'} ({teams[0]?.tag || 'TOP'})</span>
            <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold">
              {teams[0]?.pts[4] ?? teams[0]?.pts[teams[0]?.pts.length - 1] ?? 134} PTS
            </span>
          </div>
        </div>

        {/* SVG Points Race Chart */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
        >
          {/* Main Stage Card Background */}
          <rect
            x={padL}
            y={padT}
            width={cW}
            height={cH}
            rx="8"
            fill="none"
            stroke="rgba(192,132,252,0.22)"
          />

          {/* Grid Lines and Y-Axis Ticks */}
          {[0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal].map((v) => {
            const y = padT + cH - (v / maxVal) * cH;
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="rgba(148,163,184,0.22)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padL - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#cbd5e1"
                  fontSize="11"
                  fontWeight="700"
                  className="font-hud"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Vertical Guide Line on Hover */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padT}
              x2={hoveredPoint.x}
              y2={H - padB}
              stroke="rgba(251,191,36,0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Bottom Match Labels */}
          {['MATCH 1', 'MATCH 2', 'MATCH 3', 'MATCH 4', 'MATCH 5'].map((m, i) => {
            const x = padL + (i / 4) * cW;
            return (
              <g key={m}>
                <rect
                  x={x - 36}
                  y={H - 32}
                  width="72"
                  height="22"
                  rx="5"
                  fill="rgba(88,28,135,0.28)"
                  stroke="rgba(192,132,252,0.45)"
                />
                <text
                  x={x}
                  y={H - 17}
                  textAnchor="middle"
                  fill="#2dd4bf"
                  fontSize="10.5"
                  fontWeight="700"
                  className="font-hud"
                >
                  {m}
                </text>
              </g>
            );
          })}

          {/* Team Progression Curves & Callouts */}
          {teams.map((team, tIdx) => {
            const pts = team.pts.map((val, i) => ({
              x: padL + (i / 4) * cW,
              y: padT + cH - (val / maxVal) * cH,
              val,
              matchIdx: i,
            }));

            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < 4; i++) {
              const mx = (pts[i].x + pts[i + 1].x) / 2;
              d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
            }

            const last = pts[4];
            const ly = safeYs[tIdx];
            const isLeader = tIdx === 0;
            const delaySec = (160 + tIdx * 240) / 1000;

            return (
              <g key={team.tag}>
                {/* Main Curved Path */}
                <path
                  d={d}
                  fill="none"
                  stroke={team.color}
                  strokeWidth={isLeader ? 5.6 : 3.8}
                  strokeLinecap="round"
                  className="draw-line"
                  style={{
                    filter: `drop-shadow(0 0 6px ${team.color})`,
                    strokeDasharray: 2000,
                    strokeDashoffset: animStep >= 1 ? 0 : 2000,
                    transition: `stroke-dashoffset 2.0s cubic-bezier(0.22, 1, 0.36, 1) ${delaySec}s`,
                  }}
                />

                {/* Animated Wire Flow Energy */}
                <path
                  d={d}
                  fill="none"
                  stroke={team.color}
                  strokeOpacity="0.95"
                  strokeWidth={isLeader ? 3.4 : 2.4}
                  strokeLinecap="round"
                  className="wire-flow"
                  style={{
                    filter: `drop-shadow(0 0 6px ${team.color})`,
                    opacity: animStep >= 2 ? 1 : 0,
                    animationDelay: `${(tIdx * 0.35).toFixed(2)}s`,
                  }}
                />

                {/* Data Nodes */}
                {pts.map((p, pi) => {
                  const isHovered =
                    hoveredPoint?.tIdx === tIdx && hoveredPoint?.mIdx === pi;
                  return (
                    <circle
                      key={pi}
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 8.5 : isLeader ? 6.5 : 5}
                      fill={team.color}
                      stroke={isHovered ? '#ffffff' : '#090b10'}
                      strokeWidth={isHovered ? 2.5 : 2}
                      className="m2-dot-visible cursor-pointer"
                      style={{
                        filter: `drop-shadow(0 0 5px ${team.color})`,
                        opacity: animStep >= 2 ? 1 : 0,
                      }}
                      onMouseEnter={() =>
                        setHoveredPoint({ tIdx, mIdx: pi, x: p.x, y: p.y })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}

                {/* Right Callout Tag Badge & Dotted Connector */}
                <g
                  style={{
                    opacity: animStep >= 2 ? 1 : 0,
                    transition: `opacity 0.6s ease ${tIdx * 0.15}s`,
                  }}
                >
                  <path
                    d={`M ${last.x + 6} ${last.y} L ${last.x + 22} ${last.y} L ${last.x + 34} ${ly}`}
                    fill="none"
                    stroke={team.color}
                    strokeWidth={isLeader ? 2.4 : 1.8}
                    strokeDasharray="3 2"
                  />
                  <rect
                    x={last.x + 36}
                    y={ly - (isLeader ? 16 : 13)}
                    width={isLeader ? 124 : 114}
                    height={isLeader ? 32 : 26}
                    rx="7"
                    fill="rgba(59,7,100,0.38)"
                    stroke={team.color}
                    strokeWidth={isLeader ? 2.6 : 2}
                  />
                  <text
                    x={last.x + 46}
                    y={ly + (isLeader ? 5 : 4)}
                    fill={team.color}
                    fontSize={isLeader ? 13 : 11.5}
                    fontWeight="800"
                    className="font-hud"
                  >
                    #{tIdx + 1} {team.tag}
                  </text>
                  <text
                    x={last.x + (isLeader ? 151 : 141)}
                    y={ly + (isLeader ? 5 : 4)}
                    textAnchor="end"
                    fill="#fff"
                    fontSize={isLeader ? 13.5 : 12}
                    fontWeight="800"
                    className="font-hud"
                  >
                    {last.val} PTS
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip for Interactive Node Hover */}
        {hoveredPoint && (
          <div
            className="fixed pointer-events-none z-50 px-3 py-2 rounded-lg bg-slate-950/95 text-white text-xs font-hud shadow-xl border border-amber-400/40"
            style={{
              left: hoveredPoint.x + 14,
              top: hoveredPoint.y - 48,
              minWidth: 168,
            }}
          >
            <div className="flex items-center justify-between gap-2.5 border-b border-white/15 pb-1 mb-1.5">
              <span
                style={{
                  color: teams[hoveredPoint.tIdx].color,
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                #{hoveredPoint.tIdx + 1} {teams[hoveredPoint.tIdx].tag}
              </span>
              <span className="text-slate-400 text-[10px] font-bold">
                MATCH {hoveredPoint.mIdx + 1}
              </span>
            </div>
            <div className="text-slate-100 text-[11px] font-bold mb-1">
              {teams[hoveredPoint.tIdx].name}
            </div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">Total Points:</span>
              <span className="text-white font-extrabold">
                {teams[hoveredPoint.tIdx].pts[hoveredPoint.mIdx]} PTS
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Match Gain:</span>
              <span className="text-emerald-400 font-extrabold">
                +
                {hoveredPoint.mIdx === 0
                  ? teams[hoveredPoint.tIdx].pts[0]
                  : teams[hoveredPoint.tIdx].pts[hoveredPoint.mIdx] -
                    teams[hoveredPoint.tIdx].pts[hoveredPoint.mIdx - 1]}{' '}
                PTS
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
