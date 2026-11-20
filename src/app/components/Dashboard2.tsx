'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProgressionTeam {
  tag: string;
  name: string;
  color: string;
  pts: number[];
  logoUrl?: string | null;
}

const DEFAULT_PROGRESSION: ProgressionTeam[] = [
  { tag: 'TOP', name: 'TOP', color: '#fbbf24', pts: [21, 67, 81, 104, 134] },
  { tag: 'EXE', name: 'EXE', color: '#a78bfa', pts: [29, 34, 55, 73, 98] },
  { tag: 'S9x', name: 'S9x', color: '#2dd4bf', pts: [29, 31, 62, 93, 96] },
  { tag: 'CME', name: 'CME', color: '#f43f5e', pts: [14, 34, 56, 69, 93] },
  { tag: 'TRX', name: 'TRX', color: '#38bdf8', pts: [12, 27, 41, 67, 85] },
];

const DEFAULT_COLORS = {
  line1: '#fbbf24',
  line2: '#a78bfa',
  line3: '#2dd4bf',
  line4: '#f43f5e',
  line5: '#38bdf8',
  fireColor: '#8b5cf6',
};

function spreadY(items: { y: number }[], minGap: number, minY: number, maxY: number): number[] {
  const sorted = items.map((it, idx) => ({ ...it, origIdx: idx, ly: it.y })).sort((a, b) => a.ly - b.ly);
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
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [lineLengths, setLineLengths] = useState<number[]>(new Array(5).fill(1000));
  const [drawn, setDrawn] = useState<boolean[]>(new Array(5).fill(false));
  const [tagsVisible, setTagsVisible] = useState<boolean[]>(new Array(5).fill(false));

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard2) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard2 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard2');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const teams = React.useMemo(() => {
    const list = [...DEFAULT_PROGRESSION];
    list[0].color = colors.line1;
    list[1].color = colors.line2;
    list[2].color = colors.line3;
    list[3].color = colors.line4;
    list[4].color = colors.line5;

    if (dayData?.success && dayData.data && dayData.data.length >= 5) {
      dayData.data.slice(0, 5).forEach((d: any, i: number) => {
        list[i].tag = d.tag || d.name?.slice(0, 3).toUpperCase() || list[i].tag;
        list[i].name = list[i].tag;
        list[i].logoUrl = d.logoUrl || null;
        const finalPts = typeof d.total === 'number' ? d.total : parseInt(d.total, 10) || list[i].pts[4];
        list[i].pts[4] = finalPts;
      });
    }
    return list;
  }, [colors, dayData]);

  const W = 920;
  const H = 380;
  const padL = 62;
  const padR = 168;
  const padT = 36;
  const padB = 48;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const maxVal = 140;

  const safeYs = React.useMemo(() => {
    const items = teams.map((t) => ({ y: padT + cH - (t.pts[4] / maxVal) * cH }));
    return spreadY(items, 36, padT + 14, H - padB - 14);
  }, [teams, padT, cH, maxVal, H, padB]);

  useEffect(() => {
    setDrawn([false, false, false, false, false]);
    setTagsVisible([false, false, false, false, false]);

    const timers: NodeJS.Timeout[] = [];
    teams.forEach((_, idx) => {
      timers.push(
        setTimeout(() => {
          setDrawn((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, 160 + idx * 240)
      );

      timers.push(
        setTimeout(() => {
          setTagsVisible((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, 1450 + idx * 240)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [teams]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-8 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.line1} height={130} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header HUD Banner */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DF82] animate-ping" />
            <span className="font-hud text-xs font-bold uppercase tracking-wider text-teal-300">
              MATCH 1–5 PROGRESSION RACE
            </span>
          </div>
          <span className="font-hud text-[11px] text-slate-400 font-semibold">
            TOP 5 CHAMPIONSHIP RACE
          </span>
        </div>

        {/* SVG Curve Progression Canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
        >
          {/* Inner Grid Backing */}
          <rect
            x={padL}
            y={padT}
            width={cW}
            height={cH}
            rx={8}
            fill="rgba(9, 11, 18, 0.85)"
            stroke="rgba(148, 163, 184, 0.22)"
          />

          {/* Grid Horizontal Lines & Y Labels */}
          {[0, 35, 70, 105, 140].map((v) => {
            const y = padT + cH - (v / maxVal) * cH;
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.22)"
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

          {/* X Labels (Match 1 - 5) */}
          {['MATCH 1', 'MATCH 2', 'MATCH 3', 'MATCH 4', 'MATCH 5'].map((m, i) => {
            const x = padL + (i / 4) * cW;
            return (
              <g key={m}>
                <rect
                  x={x - 36}
                  y={H - 32}
                  width={72}
                  height={22}
                  rx={5}
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

          {/* Team Progression Lines */}
          {teams.map((team, tIdx) => {
            const pts = team.pts.map((val, i) => ({
              x: padL + (i / 4) * cW,
              y: padT + cH - (val / maxVal) * cH,
              val,
            }));

            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < 4; i++) {
              const mx = (pts[i].x + pts[i + 1].x) / 2;
              d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
            }

            const last = pts[4];
            const ly = safeYs[tIdx];
            const isDrawn = drawn[tIdx];
            const showTag = tagsVisible[tIdx];

            return (
              <g key={team.tag}>
                {/* Smooth Curve Path */}
                <path
                  d={d}
                  fill="none"
                  stroke={team.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="draw-line"
                  style={{
                    strokeDasharray: 1200,
                    strokeDashoffset: isDrawn ? 0 : 1200,
                  }}
                />

                {/* Nodes on points */}
                {pts.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill={team.color}
                    stroke="#090b10"
                    strokeWidth="2"
                    style={{
                      opacity: showTag ? 1 : 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  />
                ))}

                {/* Tag Callout at End of Line */}
                <g
                  style={{
                    opacity: showTag ? 1 : 0,
                    transition: 'opacity 0.6s ease',
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
                    width={116}
                    height={26}
                    rx={6}
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
                    x={last.x + 144}
                    y={ly + 4}
                    textAnchor="end"
                    fill="#ffffff"
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
