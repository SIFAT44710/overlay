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
  const [displayPctA, setDisplayPctA] = useState(0);
  const [displayPctB, setDisplayPctB] = useState(0);
  const [radarScale, setRadarScale] = useState(0);

  const themeS3 = theme?.s3 || { teamA: '#8b5cf6', teamB: '#2dd4bf' };
  const custom = theme?.custom;
  const source = theme?.sources?.[9] || theme?.sources?.[3] || 'latest_h2h';

  let a = sheetData?.h2hMatch5?.a || {
    name: 'LOADING...',
    tag: '---',
    rank: 1,
    surv: 0,
    kills: 0,
    total: 0,
    damage: 0,
    hs: 0,
    gloo: 0,
  };
  let b = sheetData?.h2hMatch5?.b || {
    name: 'LOADING...',
    tag: '---',
    rank: 2,
    surv: 0,
    kills: 0,
    total: 0,
    damage: 0,
    hs: 0,
    gloo: 0,
  };

  if (source === 'custom_h2h' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[custom?.tAIdx ?? 1] || sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[custom?.tBIdx ?? 7] || sheetData.allTeamsFull[1];
  } else if (source === 'day_top2_h2h' && sheetData?.allTeamsFull?.length) {
    a = sheetData.allTeamsFull[0];
    b = sheetData.allTeamsFull[1];
  }

  // Resolve Drive Logo for each team with full tag & name coverage
  const teamLogoMap: Record<string, string> = {};
  const registerLogo = (tag?: string, name?: string, url?: string) => {
    if (!url) return;
    if (tag) {
      teamLogoMap[tag.toUpperCase()] = url;
      teamLogoMap[tag.toLowerCase()] = url;
      teamLogoMap[tag] = url;
    }
    if (name) {
      teamLogoMap[name.toUpperCase()] = url;
      teamLogoMap[name.toLowerCase()] = url;
      teamLogoMap[name] = url;
    }
  };

  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => registerLogo(st.tag, st.name, st.logoUrl));
  }
  if (sheetData?.allTeamsFull) {
    sheetData.allTeamsFull.forEach((t) => registerLogo(t.tag, t.name, t.logoUrl));
  }

  const totSum = Math.max(1, a.total + b.total);
  const pctA = Math.round((a.total / totSum) * 100);
  const pctB = 100 - pctA;

  // Smooth 60fps Entrance & Counter Animation
  useEffect(() => {
    setAnimated(false);
    setDisplayPctA(0);
    setDisplayPctB(0);
    setRadarScale(0);

    let rafId: number;
    let start: number | null = null;
    const duration = 1600;

    const timer = setTimeout(() => {
      setAnimated(true);

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Dynamic easeOutBack spring curve for energetic esports bloom
        const c1 = 1.6;
        const c3 = c1 + 1;
        const ease = progress === 1 ? 1 : 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
        const countEase = 1 - Math.pow(1 - progress, 3);

        setDisplayPctA(Math.round(pctA * countEase));
        setDisplayPctB(Math.round(pctB * countEase));
        setRadarScale(Math.max(0, ease));

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };

      rafId = requestAnimationFrame(step);
    }, 180);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [replayKey, pctA, pctB]);

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
          className={`skew-box dark-box border-l-4 px-3 py-1 rounded-lg transition-all duration-500 w-fit max-w-[340px] relative cursor-pointer ${
            winnerSide === 'a' && animated ? 'top1-hero-glow fire-winner-card top1-scale' : ''
          }`}
          style={{
            borderLeftColor: colA,
            transform: animated ? 'translateY(0)' : 'translateY(-14px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
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
          className={`skew-box dark-box border-r-4 px-3 py-1 rounded-lg transition-all duration-500 w-fit max-w-[340px] ml-auto relative cursor-pointer ${
            winnerSide === 'b' && animated ? 'top1-hero-glow fire-winner-card top1-scale' : ''
          }`}
          style={{
            borderRightColor: colB,
            transform: animated ? 'translateY(0)' : 'translateY(-14px)',
            opacity: animated ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
          }}
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
            <defs>
              <filter id="glowA" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowB" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="outerGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Diamond Frame with Luminous Neon Glow */}
            <polygon
              points={`${CX},${CY - MAX_R} ${CX + MAX_R},${CY} ${CX},${CY + MAX_R} ${CX - MAX_R},${CY}`}
              fill="rgba(9,11,18,0.92)"
              stroke="rgba(192,132,252,0.85)"
              strokeWidth="2.5"
              filter="url(#outerGlow)"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: animated ? 'scale(1)' : 'scale(0.85)',
                opacity: animated ? 1 : 0,
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
              }}
            />
            {/* Inner Diamond Frame */}
            <polygon
              points={`${CX},${CY - MAX_R * 0.64} ${CX + MAX_R * 0.64},${CY} ${CX},${CY + MAX_R * 0.64} ${CX - MAX_R * 0.64},${CY}`}
              fill="none"
              stroke="rgba(203,213,225,0.45)"
              strokeWidth="1.5"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: animated ? 'scale(1)' : 'scale(0.85)',
                opacity: animated ? 1 : 0,
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
              }}
            />
            <line x1={CX} y1={CY - MAX_R} x2={CX} y2={CY + MAX_R} stroke="rgba(203,213,225,0.3)" />
            <line x1={CX - MAX_R} y1={CY} x2={CX + MAX_R} y2={CY} stroke="rgba(203,213,225,0.3)" />

            {/* Team A Polygon with Dynamic Neon Glow Bloom */}
            <g
              data-edit-group="s3"
              data-edit-key="teamA"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: `scale(${radarScale})`,
                opacity: animated ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              onClick={(e) => onElementClick?.(e, 's3', 'teamA', `${a.name} Color`)}
            >
              <polygon
                points={polyA}
                fill={`${colA}66`}
                stroke={colA}
                strokeWidth="4"
                filter="url(#glowA)"
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

            {/* Team B Polygon with Dynamic Neon Glow Bloom */}
            <g
              data-edit-group="s3"
              data-edit-key="teamB"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: `scale(${radarScale})`,
                opacity: animated ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              onClick={(e) => onElementClick?.(e, 's3', 'teamB', `${b.name} Color`)}
            >
              <polygon
                points={polyB}
                fill={`${colB}55`}
                stroke={colB}
                strokeWidth="4"
                filter="url(#glowB)"
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

            {/* Vertex Labels with Smooth Fade */}
            <g
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 0.6s ease 0.2s',
              }}
            >
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
            </g>
          </svg>
        </div>

        {/* Semi-Circle Head-to-Head Comparison Gauge on Right */}
        <div className="dark-box rounded-2xl p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[440px]">
            <svg viewBox="0 0 320 175" className="w-full overflow-visible">
              <path d="M 45 155 A 115 115 0 0 1 275 155" fill="none" stroke="#0b0f19" strokeWidth="30" />
              <path
                id="m12-a1"
                className="arc-sweep cursor-pointer hover:opacity-85"
                d="M 45 155 A 115 115 0 0 1 275 155"
                fill="none"
                stroke={colA}
                strokeWidth="24"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${ARC} ${ARC}`,
                  strokeDashoffset: animated ? ARC * (1 - pctA / 100) : ARC,
                  transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  filter: `drop-shadow(0 0 8px ${colA})`,
                }}
                onClick={(e) => onElementClick?.(e, 's3', 'teamA', `${a.name} Color`)}
              />
              <path
                id="m12-a2"
                className="arc-sweep cursor-pointer hover:opacity-85"
                d="M 275 155 A 115 115 0 0 0 45 155"
                fill="none"
                stroke={colB}
                strokeWidth="24"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${ARC} ${ARC}`,
                  strokeDashoffset: animated ? ARC * (1 - pctB / 100) : ARC,
                  transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  filter: `drop-shadow(0 0 8px ${colB})`,
                }}
                onClick={(e) => onElementClick?.(e, 's3', 'teamB', `${b.name} Color`)}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-3 text-center font-hud text-4xl sm:text-5xl font-extrabold text-white">
              <span
                className="cursor-pointer hover:opacity-80"
                style={{ color: colA }}
                onClick={(e) => onElementClick?.(e, 's3', 'teamA', `${a.name} Color`)}
                title={`Click to change ${a.name} color`}
              >
                {displayPctA}%
              </span>{' '}
              :{' '}
              <span
                className="cursor-pointer hover:opacity-80"
                style={{ color: colB }}
                onClick={(e) => onElementClick?.(e, 's3', 'teamB', `${b.name} Color`)}
                title={`Click to change ${b.name} color`}
              >
                {displayPctB}%
              </span>
            </div>
          </div>

          {/* Lower 3 Metrics Summary */}
          <div
            className="w-full grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/15 text-center font-hud"
            style={{
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            }}
          >
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
