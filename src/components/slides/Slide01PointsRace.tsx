'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

// Exact spreadY collision resolver from ff_admin_and_live_vmix_suite.html
function spreadY(
  items: Array<{ y: number; origIdx: number }>,
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

export default function Slide01PointsRace({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const [prevKey, setPrevKey] = useState(replayKey);
  const hasAnimatedRef = useRef(false);

  if (replayKey !== prevKey) {
    setPrevKey(replayKey);
    setAnimated(false);
  }

  // Run entrance animation once on initial mount or when replayKey changes
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
        hasAnimatedRef.current = true;
      }, 140);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(rafId);
  }, [replayKey]);

  const progression =
    sheetData?.matchProgression && sheetData.matchProgression.length >= 2
      ? sheetData.matchProgression
      : [
          { tag: '---', name: 'LOADING...', color: '#fbbf24', pts: [0, 0, 0, 0, 0] },
          { tag: '---', name: 'LOADING...', color: '#a78bfa', pts: [0, 0, 0, 0, 0] },
        ];

  const themeS0 = theme?.s0 || {
    l0: '#fbbf24',
    l1: '#a78bfa',
    l2: '#2dd4bf',
    l3: '#f43f5e',
    l4: '#38bdf8',
  };

  const leader = progression[0];

  // Canvas Dimensions
  const W = 1280;
  const H = 560;
  const padL = 88;
  const padR = 310;
  const padT = 36;
  const padB = 68;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  // Find max value across all teams to scale Y axis (standard 140 default)
  const maxVal = Math.max(140, ...progression.flatMap((t) => t.pts));

  const gridValues = [0, 35, 70, 105, 140];

  // Resolve Drive Logo for each team from sheetData.standing12
  const teamLogoMap: Record<string, string> = {};
  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => {
      if (st.logoUrl) {
        teamLogoMap[st.tag.toUpperCase()] = st.logoUrl;
        teamLogoMap[st.name.toUpperCase()] = st.logoUrl;
      }
    });
  }

  // Calculate safe non-overlapping Y coordinates for endpoint tags
  const rawYs = progression.map((t, idx) => {
    const lastVal = t.pts[t.pts.length - 1] ?? 0;
    return { y: padT + cH - (lastVal / maxVal) * cH, origIdx: idx };
  });
  const safeYs = spreadY(rawYs, 62, padT + 28, H - padB - 28);

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top-Right Compact #1 Leader Pill */}
      {leader && (
        <div className="absolute top-1 right-3 sm:right-6 z-30">
          <div
            id="m2-top1-pill"
            className={`transition-all duration-700 px-3 py-1 rounded-lg bg-slate-950/90 border border-purple-400/80 font-hud text-sm sm:text-base font-bold text-white flex items-center gap-2.5 shadow-xl top1-hero-glow ${
              animated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <SpiritFireCanvas />
            <TeamLogoBadge
              tag={leader.tag}
              name={leader.name}
              logoUrl={teamLogoMap[leader.tag.toUpperCase()] || teamLogoMap[leader.name.toUpperCase()]}
              color={themeS0.l0 || leader.color}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
            <span className="text-amber-400 font-extrabold text-xs sm:text-sm">#1 LEADER</span>
            <span className="font-extrabold truncate max-w-[200px]">
              {leader.name} ({leader.tag})
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-xs sm:text-sm">
              {leader.pts[leader.pts.length - 1]} PTS
            </span>
          </div>
        </div>
      )}

      {/* Main SVG Graph */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
      >
        {/* Background Box Frame */}
        <rect
          x={padL}
          y={padT}
          width={cW}
          height={cH}
          rx="8"
          fill="none"
          stroke="rgba(192,132,252,0.22)"
        />

        {/* Horizontal Grid lines and Large 26px Y-Axis Numbers */}
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

        {/* X-Axis Match 1–5 Badges */}
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

        {/* Dynamic Cubic Curve Lines & Right Endpoint Pills */}
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
          const ly = safeYs[tIdx] ?? last.y;
          const boxW = isLeader ? 290 : 272;
          const boxH = isLeader ? 58 : 52;
          const logoR = isLeader ? 23 : 20;
          const logoCx = last.x + 62;
          const isLightCol = col === '#fbbf24' || col === '#F5B700' || col === '#2dd4bf';

          const teamLogoUrl =
            teamLogoMap[rawTeam.tag.toUpperCase()] ||
            teamLogoMap[rawTeam.name.toUpperCase()];

          return (
            <g key={rawTeam.tag}>
              {/* Cubic Bezier Running Line */}
              <path
                d={d}
                fill="none"
                stroke={col}
                strokeWidth={isLeader ? 5.8 : 4}
                strokeLinecap="round"
                className="draw-line cursor-pointer"
                style={{
                  filter: `drop-shadow(0 0 6px ${col})`,
                  strokeDasharray: '2000',
                  strokeDashoffset: animated ? '0' : '2000',
                  transition: `stroke-dashoffset 2.0s cubic-bezier(0.22, 1, 0.36, 1) ${tIdx * 0.18}s`,
                }}
                data-edit-group="s0"
                data-edit-key={colKey}
                onClick={(e) =>
                  onElementClick?.(e, 's0', colKey, `#${tIdx + 1} ${rawTeam.tag} Line`)
                }
              />

              {/* Data Point Nodes along line */}
              {pts.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r={isLeader ? 7 : 5.5}
                  fill={col}
                  stroke="#090b10"
                  strokeWidth="2"
                  opacity={animated ? 1 : 0}
                  className="cursor-pointer"
                  style={{
                    transition: `opacity 0.5s ease ${1.1 + tIdx * 0.18}s`,
                  }}
                  onClick={(e) =>
                    onElementClick?.(e, 's0', colKey, `#${tIdx + 1} ${rawTeam.tag} Node`)
                  }
                />
              ))}

              {/* Non-overlapping Endpoint Tag Pill */}
              <g
                opacity={animated ? 1 : 0}
                style={{
                  transition: `opacity 0.6s ease ${1.2 + tIdx * 0.18}s`,
                }}
              >
                {/* Dashed connector line to spread tag position */}
                <path
                  d={`M ${last.x + 6} ${last.y} L ${last.x + 20} ${last.y} L ${last.x + 32} ${ly}`}
                  fill="none"
                  stroke={col}
                  strokeWidth={isLeader ? 2.4 : 1.8}
                  strokeDasharray="3 2"
                />

                {/* Pill Background Box */}
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

                {/* Team Logo Badge: ForeignObject for real Drive Logo with Shield Fallback */}
                <foreignObject
                  x={logoCx - logoR}
                  y={ly - logoR}
                  width={logoR * 2}
                  height={logoR * 2}
                  className="overflow-visible"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <TeamLogoBadge
                      tag={rawTeam.tag}
                      name={rawTeam.name}
                      logoUrl={teamLogoUrl}
                      color={col}
                      sizeCls={isLeader ? 'w-11 h-11' : 'w-10 h-10'}
                      textSizeCls="text-sm"
                    />
                  </div>
                </foreignObject>

                {/* Team Tag Label */}
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

                {/* Points Full Text */}
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
