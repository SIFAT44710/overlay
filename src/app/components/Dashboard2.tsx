'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProgressionTeam {
  tag: string;
  color: string;
  pts: number[];
}

const DEFAULT_PROGRESSION: ProgressionTeam[] = [
  { tag: 'TOP', color: '#fbbf24', pts: [21, 67, 81, 104, 134] },
  { tag: 'EXE', color: '#a78bfa', pts: [29, 34, 55, 73, 98] },
  { tag: 'S9x', color: '#2dd4bf', pts: [29, 31, 62, 93, 96] },
  { tag: 'CME', color: '#f43f5e', pts: [14, 34, 56, 69, 93] },
  { tag: 'TRX', color: '#38bdf8', pts: [12, 27, 41, 67, 85] },
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

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const teams: ProgressionTeam[] = React.useMemo(() => {
    if (sheetData?.history && Array.isArray(sheetData.history) && sheetData.history.length >= 2) {
      // If live progression is in sheet
      return DEFAULT_PROGRESSION;
    }
    return DEFAULT_PROGRESSION;
  }, [sheetData]);

  const W = 920;
  const H = 370;
  const padL = 62;
  const padR = 165;
  const padT = 32;
  const padB = 48;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  const safeYs = spreadY(
    teams.map((t) => ({ y: padT + cH - (t.pts[4] / 140) * cH })),
    36,
    padT + 14,
    H - padB - 14
  );

  useEffect(() => {
    // Sequential trigger for paths, nodes, and callouts
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setAnimStep(1), 160));
    timers.push(setTimeout(() => setAnimStep(2), 1450));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-5xl">
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
            fill="rgba(9,11,18,0.75)"
            stroke="rgba(148,163,184,0.22)"
          />

          {/* Grid Lines and Y-Axis Value Ticks */}
          {[0, 35, 70, 105, 140].map((v) => {
            const y = padT + cH - (v / 140) * cH;
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

          {/* Bottom Match X-Axis Pills */}
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
                  fill="#0f172a"
                  stroke="#334155"
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

          {/* Team Progression Curves & Callout Badges */}
          {teams.map((team, tIdx) => {
            const pts = team.pts.map((val, i) => ({
              x: padL + (i / 4) * cW,
              y: padT + cH - (val / 140) * cH,
              val,
            }));

            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < 4; i++) {
              const mx = (pts[i].x + pts[i + 1].x) / 2;
              d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
            }

            const last = pts[4];
            const ly = safeYs[tIdx];
            const delaySec = (160 + tIdx * 240) / 1000;

            return (
              <g key={team.tag}>
                {/* Curved Multi-Line */}
                <path
                  d={d}
                  fill="none"
                  stroke={team.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="draw-line"
                  style={{
                    strokeDasharray: 2000,
                    strokeDashoffset: animStep >= 1 ? 0 : 2000,
                    transition: `stroke-dashoffset 2.0s cubic-bezier(0.22, 1, 0.36, 1) ${delaySec}s`,
                  }}
                />

                {/* Nodes */}
                {pts.map((p, pi) => (
                  <circle
                    key={pi}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill={team.color}
                    stroke="#090b10"
                    strokeWidth="2"
                    style={{
                      opacity: animStep >= 2 ? 1 : 0,
                      transition: `opacity 0.4s ease ${tIdx * 0.15}s`,
                    }}
                  />
                ))}

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
                    strokeWidth="1.8"
                    strokeDasharray="3 2"
                  />
                  <rect
                    x={last.x + 36}
                    y={ly - 13}
                    width="114"
                    height="26"
                    rx="6"
                    fill="#090b10"
                    stroke={team.color}
                    strokeWidth="2"
                  />
                  <text
                    x={last.x + 46}
                    y={ly + 4}
                    fill={team.color}
                    fontSize="11.5"
                    fontWeight="800"
                    className="font-hud"
                  >
                    #{tIdx + 1} {team.tag}
                  </text>
                  <text
                    x={last.x + 141}
                    y={ly + 4}
                    textAnchor="end"
                    fill="#fff"
                    fontSize="12"
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
      </div>
    </div>
  );
}
