'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide04TeamH2H({
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

  const themeS3 = theme?.s3 || { teamA: '#8b5cf6', teamB: '#2dd4bf' };
  const custom = theme?.custom;
  const source = theme?.sources?.[3] || 'latest_h2h';

  let a = sheetData?.h2hMatch5?.a || {
    name: 'EXTREME EX',
    tag: 'EXE',
    rank: 2,
    surv: 22,
    kills: 76,
    total: 98,
    damage: 42349,
    hs: 67,
    gloo: 340,
  };
  let b = sheetData?.h2hMatch5?.b || {
    name: '69 ESPORTS',
    tag: '69',
    rank: 8,
    surv: 13,
    kills: 48,
    total: 61,
    damage: 27036,
    hs: 46,
    gloo: 185,
  };

  if (source === 'custom_h2h' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[custom?.tAIdx ?? 1] || sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[custom?.tBIdx ?? 7] || sheetData.allTeamsFull[1];
  } else if (source === 'day_top2_h2h' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[1];
  }

  // Resolve Drive Logo for each team
  const teamLogoMap: Record<string, string> = {};
  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => {
      if (st.logoUrl) {
        teamLogoMap[st.tag.toUpperCase()] = st.logoUrl;
        teamLogoMap[st.name.toUpperCase()] = st.logoUrl;
      }
    });
  }

  const totSum = Math.max(1, a.total + b.total);
  const pctA = Math.round((a.total / totSum) * 100);
  const pctB = 100 - pctA;

  const R = 115;
  const ARC = Math.PI * R;
  const CX = 210;
  const CY = 165;
  const MAX_R = 96;

  const maxK = Math.max(a.kills, b.kills, 1) * 1.12;
  const maxD = Math.max(a.damage, b.damage, 1) * 1.12;
  const maxH = Math.max(a.hs, b.hs, 1) * 1.12;
  const maxG = Math.max(a.gloo, b.gloo, 1) * 1.12;

  const calcD = (t: typeof a) => {
    const rT = Math.max(14, (t.kills / maxK) * MAX_R);
    const rR = Math.max(14, (t.damage / maxD) * MAX_R);
    const rB = Math.max(14, (t.hs / maxH) * MAX_R);
    const rL = Math.max(14, (t.gloo / maxG) * MAX_R);
    return [
      [CX, CY - rT],
      [CX + rR, CY],
      [CX, CY + rB],
      [CX - rL, CY],
    ];
  };

  const ptsA = calcD(a);
  const ptsB = calcD(b);
  const polyA = ptsA.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const polyB = ptsB.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const colA = themeS3.teamA;
  const colB = themeS3.teamB;
  const winnerSide = a.total >= b.total ? 'a' : 'b';

  return (
    <div className="w-full max-w-[1340px] pt-20 relative font-hud select-none">
      {/* Top Header Plates */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex flex-row justify-between items-start gap-4 z-30">
        {/* Team A Card */}
        <div
          id="m12-card-a"
          className="skew-box dark-box border-l-4 px-3 py-1 rounded-lg transition-all duration-500 w-fit max-w-[340px] relative cursor-pointer"
          style={{ borderLeftColor: colA }}
          onClick={(e) => onElementClick?.(e, 's3', 'teamA', `${a.name} Color`)}
        >
          {winnerSide === 'a' && <SpiritFireCanvas />}
          <div className="unskew flex items-center gap-2.5">
            <TeamLogoBadge
              tag={a.tag}
              name={a.name}
              logoUrl={teamLogoMap[a.tag.toUpperCase()] || teamLogoMap[a.name.toUpperCase()]}
              color={colA}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div>
              <div className="text-xs font-bold leading-none" style={{ color: colA }}>
                RANK #{a.rank}
              </div>
              <div className="font-hud text-base sm:text-lg font-bold text-white leading-tight truncate max-w-[140px]">
                {a.name}
              </div>
            </div>
            <div className="font-hud text-lg sm:text-xl font-bold ml-1" style={{ color: colA }}>
              {a.total} PTS
            </div>
          </div>
        </div>

        {/* Team B Card */}
        <div
          id="m12-card-b"
          className="skew-box dark-box border-r-4 px-3 py-1 rounded-lg transition-all duration-500 w-fit max-w-[340px] ml-auto relative cursor-pointer"
          style={{ borderRightColor: colB }}
          onClick={(e) => onElementClick?.(e, 's3', 'teamB', `${b.name} Color`)}
        >
          {winnerSide === 'b' && <SpiritFireCanvas />}
          <div className="unskew flex items-center gap-2.5">
            <div className="font-hud text-lg sm:text-xl font-bold mr-1" style={{ color: colB }}>
              {b.total} PTS
            </div>
            <div className="text-right">
              <div className="text-xs font-bold leading-none" style={{ color: colB }}>
                RANK #{b.rank}
              </div>
              <div className="font-hud text-base sm:text-lg font-bold text-white leading-tight truncate max-w-[140px]">
                {b.name}
              </div>
            </div>
            <TeamLogoBadge
              tag={b.tag}
              name={b.name}
              logoUrl={teamLogoMap[b.tag.toUpperCase()] || teamLogoMap[b.name.toUpperCase()]}
              color={colB}
              sizeCls="w-8 h-8 sm:w-9 sm:h-9"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Diamond Radar on Left, Semi-Circle Gauge on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Dynamic 4-Corner Diamond Radar */}
        <div className="dark-box rounded-2xl p-6 flex justify-center">
          <svg viewBox="0 0 420 330" className="w-full max-w-[500px] overflow-visible">
            {/* Outer Diamond Frame */}
            <polygon
              points={`${CX},${CY - MAX_R} ${CX + MAX_R},${CY} ${CX},${CY + MAX_R} ${CX - MAX_R},${CY}`}
              fill="rgba(9,11,18,0.88)"
              stroke="rgba(192,132,252,0.5)"
              strokeWidth="2"
            />
            {/* Inner Diamond Frame */}
            <polygon
              points={`${CX},${CY - MAX_R * 0.64} ${CX + MAX_R * 0.64},${CY} ${CX},${CY + MAX_R * 0.64} ${CX - MAX_R * 0.64},${CY}`}
              fill="none"
              stroke="rgba(148,163,184,0.3)"
            />
            <line x1={CX} y1={CY - MAX_R} x2={CX} y2={CY + MAX_R} stroke="rgba(148,163,184,0.24)" />
            <line x1={CX - MAX_R} y1={CY} x2={CX + MAX_R} y2={CY} stroke="rgba(148,163,184,0.24)" />

            {/* Team A Polygon */}
            <g
              data-edit-group="s3"
              data-edit-key="teamA"
              onClick={(e) => onElementClick?.(e, 's3', 'teamA', `${a.name} Color`)}
            >
              <polygon
                points={polyA}
                fill={`${colA}4A`}
                stroke={colA}
                strokeWidth="3.6"
                className="transition-all duration-700"
              />
              {ptsA.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt[0].toFixed(1)}
                  cy={pt[1].toFixed(1)}
                  r="6"
                  fill={colA}
                  stroke="#090b10"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Team B Polygon */}
            <g
              data-edit-group="s3"
              data-edit-key="teamB"
              onClick={(e) => onElementClick?.(e, 's3', 'teamB', `${b.name} Color`)}
            >
              <polygon
                points={polyB}
                fill={`${colB}3E`}
                stroke={colB}
                strokeWidth="3.6"
                className="transition-all duration-700"
              />
              {ptsB.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt[0].toFixed(1)}
                  cy={pt[1].toFixed(1)}
                  r="6"
                  fill={colB}
                  stroke="#090b10"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* Vertex Top: KILLS (Cleanly Outside) */}
            <text x={CX} y="30" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800" className="font-hud">
              KILLS
            </text>
            <text x={CX} y="52" textAnchor="middle" fill="#fde047" fontSize="20" fontWeight="800" className="font-hud">
              {a.kills} vs {b.kills}
            </text>

            {/* Vertex Right: DAMAGE (Cleanly Outside) */}
            <text x={CX + MAX_R + 14} y={CY - 4} textAnchor="start" fill="#fff" fontSize="22" fontWeight="800" className="font-hud">
              DAMAGE
            </text>
            <text x={CX + MAX_R + 14} y={CY + 18} textAnchor="start" fill="#7dd3fc" fontSize="18" fontWeight="800" className="font-hud">
              {formatNumber(a.damage)} vs {formatNumber(b.damage)}
            </text>

            {/* Vertex Bottom: HEADSHOTS (Cleanly Outside) */}
            <text x={CX} y="294" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800" className="font-hud">
              HEADSHOTS
            </text>
            <text x={CX} y="316" textAnchor="middle" fill="#fde047" fontSize="20" fontWeight="800" className="font-hud">
              {a.hs} vs {b.hs}
            </text>

            {/* Vertex Left: GLOO WALL (Cleanly Outside) */}
            <text x={CX - MAX_R - 14} y={CY - 4} textAnchor="end" fill="#fff" fontSize="22" fontWeight="800" className="font-hud">
              GLOO WALL
            </text>
            <text x={CX - MAX_R - 14} y={CY + 18} textAnchor="end" fill="#5eead4" fontSize="20" fontWeight="800" className="font-hud">
              {a.gloo} vs {b.gloo}
            </text>
          </svg>
        </div>

        {/* Semi-Circle Head-to-Head Comparison Gauge on Right */}
        <div className="dark-box rounded-2xl p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[440px]">
            <svg viewBox="0 0 320 175" className="w-full overflow-visible">
              <path d="M 45 155 A 115 115 0 0 1 275 155" fill="none" stroke="#0b0f19" strokeWidth="30" />
              <path
                id="m12-a1"
                className="arc-sweep"
                d="M 45 155 A 115 115 0 0 1 275 155"
                fill="none"
                stroke={colA}
                strokeWidth="24"
                style={{
                  strokeDasharray: ARC,
                  strokeDashoffset: animated ? ARC * (1 - pctA / 100) : ARC,
                  transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1)',
                }}
              />
              <path
                id="m12-a2"
                className="arc-sweep"
                d="M 275 155 A 115 115 0 0 0 45 155"
                fill="none"
                stroke={colB}
                strokeWidth="24"
                style={{
                  strokeDasharray: ARC,
                  strokeDashoffset: animated ? ARC * (1 - pctB / 100) : ARC,
                  transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1)',
                }}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-3 text-center font-hud text-4xl sm:text-5xl font-extrabold text-white">
              <span style={{ color: colA }}>{animated ? `${pctA}%` : '0%'}</span> :{' '}
              <span style={{ color: colB }}>{animated ? `${pctB}%` : '0%'}</span>
            </div>
          </div>

          {/* Lower 3 Metrics Summary */}
          <div className="w-full grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/15 text-center font-hud">
            <div>
              <div className="text-slate-400 text-xs">DAMAGE</div>
              <div className="font-extrabold text-white text-xl">
                {formatNumber(a.damage)} vs {formatNumber(b.damage)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">HEADSHOTS</div>
              <div className="font-extrabold text-white text-xl">
                {formatNumber(a.hs)} vs {formatNumber(b.hs)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">GLOO USED</div>
              <div className="font-extrabold text-white text-xl">
                {formatNumber(a.gloo)} vs {formatNumber(b.gloo)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
