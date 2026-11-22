'use client';

import React, { useEffect, useState } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide01PointsRace({ sheetData, theme, onElementClick }: SlideProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const progression = sheetData?.matchProgression && sheetData.matchProgression.length >= 2
    ? sheetData.matchProgression
    : [
        { tag: 'TOP', name: 'RAAD VAI YT', color: '#fbbf24', pts: [21, 67, 81, 104, 134] },
        { tag: 'EXE', name: 'EXTREME EX', color: '#a78bfa', pts: [29, 34, 55, 73, 98] },
        { tag: 'S9x', name: 'SNEAKY9X', color: '#2dd4bf', pts: [29, 31, 62, 93, 96] },
        { tag: 'CME', name: 'COFFIN MAKERS ESP', color: '#f43f5e', pts: [14, 34, 56, 69, 93] },
        { tag: 'TRX', name: 'TITANOVA REX', color: '#38bdf8', pts: [12, 27, 41, 67, 85] },
      ];

  const themeS0 = theme?.s0 || { l0: '#fbbf24', l1: '#a78bfa', l2: '#2dd4bf', l3: '#f43f5e', l4: '#38bdf8' };
  const leader = progression[0];

  const W = 1280;
  const H = 560;
  const padL = 88;
  const padR = 310;
  const padT = 36;
  const padB = 68;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  // Find max value across all teams to scale Y axis (default 140)
  const maxVal = Math.max(140, ...progression.flatMap((t) => t.pts));

  const gridValues = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  // Calculate safe spread Y coordinates for endpoint tags
  const rawYs = progression.map((t) => {
    const lastVal = t.pts[t.pts.length - 1] || 0;
    return padT + cH - (lastVal / maxVal) * cH;
  });

  const safeYs = [...rawYs];
  const minGap = 58;
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 1; i < safeYs.length; i++) {
      const diff = safeYs[i] - safeYs[i - 1];
      if (Math.abs(diff) < minGap) {
        const push = (minGap - Math.abs(diff)) / 2;
        if (diff >= 0) {
          safeYs[i - 1] -= push;
          safeYs[i] += push;
        } else {
          safeYs[i - 1] += push;
          safeYs[i] -= push;
        }
      }
    }
  }

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud">
      {/* Top-Right Leader Pill */}
      {leader && (
        <div className="absolute top-1 right-3 sm:right-6 z-30">
          <div className="relative px-4 py-1.5 rounded-xl bg-slate-950/90 border border-purple-400/70 font-hud text-2xl sm:text-3xl font-bold text-white flex items-center gap-3.5 shadow-2xl top1-hero-glow">
            <SpiritFireCanvas />
            <TeamLogoBadge
              tag={leader.tag}
              name={leader.name}
              color={themeS0.l0 || leader.color}
              sizeCls="w-16 h-16"
            />
            <span className="text-amber-400">#1 LEADER</span>
            <span>
              {leader.name} ({leader.tag})
            </span>
            <span className="px-3.5 py-0.5 rounded bg-amber-400 text-black font-bold text-2xl sm:text-3xl">
              {leader.pts[leader.pts.length - 1]} PTS
            </span>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
      >
        <rect
          x={padL}
          y={padT}
          width={cW}
          height={cH}
          rx="8"
          fill="none"
          stroke="rgba(192,132,252,0.22)"
        />

        {/* Grid lines and Y-axis full numbers */}
        {gridValues.map((v) => {
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
                x={padL - 12}
                y={y + 8}
                textAnchor="end"
                fill="#ffffff"
                fontSize="26"
                fontWeight="800"
                className="font-hud"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* X-axis Match 1–5 badges */}
        {['MATCH 1', 'MATCH 2', 'MATCH 3', 'MATCH 4', 'MATCH 5'].map((m, i) => {
          const x = padL + (i / 4) * cW;
          return (
            <g key={m}>
              <rect
                x={x - 54}
                y={H - 48}
                width="108"
                height="34"
                rx="7"
                fill="rgba(88,28,135,0.34)"
                stroke="rgba(192,132,252,0.55)"
              />
              <text
                x={x}
                y={H - 24}
                textAnchor="middle"
                fill="#2dd4bf"
                fontSize="20"
                fontWeight="800"
                className="font-hud"
              >
                {m}
              </text>
            </g>
          );
        })}

        {/* Lines and Endpoints */}
        {progression.map((rawTeam, tIdx) => {
          const colKey = `l${tIdx}` as keyof typeof themeS0;
          const col = (themeS0 as any)[colKey] || rawTeam.color;
          const isLeader = tIdx === 0;

          const pts = rawTeam.pts.map((val, i) => ({
            x: padL + (i / 4) * cW,
            y: padT + cH - (val / maxVal) * cH,
            val,
          }));

          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 0; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
          }

          const last = pts[pts.length - 1];
          const ly = safeYs[tIdx] || last.y;
          const boxW = isLeader ? 268 : 248;
          const boxH = isLeader ? 58 : 52;
          const logoR = isLeader ? 23 : 20;
          const logoCx = last.x + 62;
          const isLightCol = col === '#fbbf24' || col === '#F5B700' || col === '#2dd4bf';

          return (
            <g key={rawTeam.tag}>
              <path
                d={d}
                fill="none"
                stroke={col}
                strokeWidth={isLeader ? 5.8 : 4}
                strokeLinecap="round"
                className="draw-line"
                style={{
                  filter: `drop-shadow(0 0 6px ${col})`,
                  strokeDasharray: mounted ? '0' : '2000',
                  strokeDashoffset: mounted ? '0' : '2000',
                  transition: 'stroke-dashoffset 2.0s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                data-edit-group="s0"
                data-edit-key={colKey}
                onClick={(e) =>
                  onElementClick?.(e, 's0', colKey, `#${tIdx + 1} ${rawTeam.tag} Line`)
                }
              />

              {pts.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r={isLeader ? 7 : 5.5}
                  fill={col}
                  stroke="#090b10"
                  strokeWidth="2"
                  opacity={mounted ? 1 : 0}
                  style={{ transition: 'opacity 0.5s ease 1.2s' }}
                />
              ))}

              {/* Endpoint pill with Drive logo badge, tag, and full points */}
              <g opacity={mounted ? 1 : 0} style={{ transition: 'opacity 0.6s ease 1.3s' }}>
                <path
                  d={`M ${last.x + 6} ${last.y} L ${last.x + 20} ${last.y} L ${last.x + 32} ${ly}`}
                  fill="none"
                  stroke={col}
                  strokeWidth={isLeader ? 2.4 : 1.8}
                  strokeDasharray="3 2"
                />
                <rect
                  x={last.x + 34}
                  y={ly - boxH / 2}
                  width={boxW}
                  height={boxH}
                  rx="10"
                  fill="rgba(18,12,38,0.88)"
                  stroke={col}
                  strokeWidth={isLeader ? 2.8 : 2.2}
                  data-edit-group="s0"
                  data-edit-key={colKey}
                  onClick={(e) =>
                    onElementClick?.(e, 's0', colKey, `#${tIdx + 1} ${rawTeam.tag} Pill`)
                  }
                />
                {/* Team Logo Badge */}
                <circle
                  cx={logoCx}
                  cy={ly}
                  r={logoR}
                  fill={col}
                  stroke="#090b10"
                  strokeWidth="2.4"
                />
                <text
                  x={logoCx}
                  y={ly + 5.5}
                  textAnchor="middle"
                  fill={isLightCol ? '#090b10' : '#ffffff'}
                  fontSize="16"
                  fontWeight="800"
                  className="font-hud"
                  style={{ stroke: 'none' }}
                >
                  {rawTeam.tag.slice(0, 3)}
                </text>
                <text
                  x={logoCx + logoR + 11}
                  y={ly + 8}
                  fill={col}
                  fontSize={isLeader ? 23 : 20}
                  fontWeight="800"
                  className="font-hud"
                >
                  #{tIdx + 1} {rawTeam.tag}
                </text>
                <text
                  x={last.x + 34 + boxW - 12}
                  y={ly + 8}
                  textAnchor="end"
                  fill="#ffffff"
                  fontSize={isLeader ? 25 : 22}
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
  );
}
