'use client';

import React, { useEffect, useState } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide07FastRadar({ sheetData, theme, replayKey = 0, onElementClick }: SlideProps) {
  const [mounted, setMounted] = useState(false);
  const [prevKey, setPrevKey] = useState(replayKey);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  if (replayKey !== prevKey) {
    setPrevKey(replayKey);
    setMounted(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, [replayKey]);

  const themeS6 = theme?.s6 || { rank1: '#E11D48', rank2: '#A78BFA', outerBox: '#090b12' };
  const custom = theme?.custom;
  const source = theme?.sources?.[5] || theme?.sources?.[6] || 'sheet_h2h_radar';

  const allTeams = sheetData?.allTeamsFull || [];
  let teamA: any = allTeams[0] || {
    rank: 1,
    name: 'LOADING...',
    tag: '---',
    total: 0,
    kills: 0,
    damage: 0,
    hs: 0,
    gloo: 0,
  };
  let teamB: any = allTeams[1] || {
    rank: 2,
    name: 'LOADING...',
    tag: '---',
    total: 0,
    kills: 0,
    damage: 0,
    hs: 0,
    gloo: 0,
  };

  if (source === 'sheet_h2h_radar' && sheetData?.h2hMatch5?.a && sheetData?.h2hMatch5?.b) {
    teamA = sheetData.h2hMatch5.a;
    teamB = sheetData.h2hMatch5.b;
  } else if (source === 'custom_radar_h2h' && allTeams.length >= 2) {
    teamA = allTeams[custom?.rAIdx ?? 0] || allTeams[0];
    teamB = allTeams[custom?.rBIdx ?? 1] || allTeams[1];
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

  const axes = ['KILLS', 'DAMAGE', 'HEADSHOTS', 'GLOO WALL', 'TOTAL PTS'];
  const maxVals = [
    Math.max(teamA.kills, teamB.kills, 1) * 1.15,
    Math.max(teamA.damage, teamB.damage, 1) * 1.15,
    Math.max(teamA.hs, teamB.hs, 1) * 1.15,
    Math.max(teamA.gloo, teamB.gloo, 1) * 1.15,
    Math.max(teamA.total, teamB.total, 1) * 1.15,
  ];

  const norm = (t: typeof teamA) => [
    Math.min(90, Math.round((t.kills / maxVals[0]) * 90)),
    Math.min(90, Math.round((t.damage / maxVals[1]) * 90)),
    Math.min(90, Math.round((t.hs / maxVals[2]) * 90)),
    Math.min(90, Math.round((t.gloo / maxVals[3]) * 90)),
    Math.min(90, Math.round((t.total / maxVals[4]) * 90)),
  ];

  const top2 = [
    {
      rank: teamB.rank,
      name: teamB.name,
      tag: teamB.tag,
      color: themeS6.rank2,
      pts: teamB.total,
      kills: teamB.kills,
      dmg: teamB.damage,
      vals: norm(teamB),
    },
    {
      rank: teamA.rank,
      name: teamA.name,
      tag: teamA.tag,
      color: themeS6.rank1,
      pts: teamA.total,
      kills: teamA.kills,
      dmg: teamA.damage,
      vals: norm(teamA),
    },
  ];

  const CX = 310;
  const CY = 275;
  const maxR = 175;

  const ptAt = (axisIdx: number, pct: number) => {
    const ang = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 5;
    const r = maxR * (pct / 100);
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  };

  const polyStr = (vals: number[]) =>
    vals.map((v, i) => ptAt(i, v).map((n) => n.toFixed(1)).join(',')).join(' ');

  return (
    <div className="w-full max-w-[1340px] flex flex-col items-center pt-18 relative font-hud select-none">
      {/* Top VS Badges */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex items-center justify-between gap-3 z-30">
        {/* Team A Pill */}
        <div
          id="t2-pill-a"
          className="px-3 py-1 rounded-lg dark-box font-hud text-sm sm:text-base font-bold text-white inline-flex items-center gap-2.5 border-l-4 relative shadow-xl cursor-pointer"
          style={{
            borderLeftColor: themeS6.rank1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.4s ease 1.25s, transform 0.4s ease 1.25s',
          }}
          onClick={(e) => onElementClick?.(e, 's6', 'rank1', `#${teamA.rank} ${teamA.name}`)}
        >
          <TeamLogoBadge
            tag={teamA.tag}
            name={teamA.name}
            logoUrl={teamLogoMap[teamA.tag.toUpperCase()] || teamLogoMap[teamA.name.toUpperCase()]}
            color={themeS6.rank1}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="truncate max-w-[160px]">
            #{teamA.rank} {teamA.name}
          </span>
          <span
            className="px-2 py-0.5 rounded text-white text-xs sm:text-sm font-extrabold"
            style={{ backgroundColor: themeS6.rank1 }}
          >
            {formatNumber(teamA.total)} PTS
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-hud text-xs sm:text-sm font-extrabold shadow-md">
          VS
        </span>

        {/* Team B Pill */}
        <div
          id="t2-pill-b"
          className="px-3 py-1 rounded-lg dark-box font-hud text-sm sm:text-base font-bold text-white inline-flex items-center gap-2.5 border-r-4 shadow-xl cursor-pointer"
          style={{
            borderRightColor: themeS6.rank2,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.4s ease 0.56s, transform 0.4s ease 0.56s',
          }}
          onClick={(e) => onElementClick?.(e, 's6', 'rank2', `#${teamB.rank} ${teamB.name}`)}
        >
          <span
            className="px-2 py-0.5 rounded text-white text-xs sm:text-sm font-extrabold"
            style={{ backgroundColor: themeS6.rank2 }}
          >
            {formatNumber(teamB.total)} PTS
          </span>
          <span className="truncate max-w-[160px]">
            #{teamB.rank} {teamB.name}
          </span>
          <TeamLogoBadge
            tag={teamB.tag}
            name={teamB.name}
            logoUrl={teamLogoMap[teamB.tag.toUpperCase()] || teamLogoMap[teamB.name.toUpperCase()]}
            color={themeS6.rank2}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
        </div>
      </div>

      {/* Radar SVG with overflow-visible to ensure no text clipping */}
      <svg viewBox="0 0 620 550" className="w-full max-w-[660px] overflow-visible">
        {/* Radar Expanding Rings */}
        {[25, 50, 75, 100].map((p, idx) => (
          <polygon
            key={p}
            points={polyStr([p, p, p, p, p])}
            fill={p === 100 ? `${themeS6.outerBox}d4` : 'none'}
            stroke={`rgba(226,232,240,${p === 100 ? 0.68 : 0.25})`}
            strokeWidth={p === 100 ? 2.6 : 1.3}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: mounted ? 'scale(1)' : 'scale(0)',
              opacity: mounted ? 1 : 0,
              transition: `transform 0.60s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s, opacity 0.45s ease`,
            }}
          />
        ))}

        {/* Radar Spokes & Axis Text Labels */}
        {axes.map((lbl, i) => {
          const [x2, y2] = ptAt(i, 100);
          // Separated well outside the radar polygon (128% radius + directional padding)
          const [lx, ly] = ptAt(i, 128);
          const anchor = i === 0 ? 'middle' : i === 1 || i === 2 ? 'start' : 'end';
          const dxOffset = i === 1 || i === 2 ? 14 : i === 3 || i === 4 ? -14 : 0;
          const dyOffset = i === 0 ? -12 : i === 2 || i === 3 ? 10 : 4;

          return (
            <g key={lbl}>
              {/* Spoke line from center to outer ring */}
              <line
                x1={CX}
                y1={CY}
                x2={x2.toFixed(1)}
                y2={y2.toFixed(1)}
                stroke="rgba(226,232,240,0.24)"
                strokeWidth="1.4"
              />
              {/* Subtle guide tick pointing toward the detached label */}
              <line
                x1={x2.toFixed(1)}
                y1={y2.toFixed(1)}
                x2={(CX + (x2 - CX) * 1.09).toFixed(1)}
                y2={(CY + (y2 - CY) * 1.09).toFixed(1)}
                stroke="rgba(251,191,36,0.5)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={(lx + dxOffset).toFixed(1)}
                y={(ly + dyOffset).toFixed(1)}
                textAnchor={anchor}
                fill="#ffffff"
                stroke="rgba(9,11,18,0.96)"
                strokeWidth="4"
                paintOrder="stroke fill"
                fontSize="21"
                fontWeight="900"
                letterSpacing="1"
                className="font-hud"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.4s ease ${0.22 + i * 0.06}s`,
                }}
              >
                {lbl}
              </text>
            </g>
          );
        })}

        {/* Top 2 Polygons: Team B (i=0) animates at 0.56s, Team A (i=1) animates at 1.25s */}
        {top2.map((t, i) => {
          const dots = t.vals.map((v, ai) => {
            const [dx, dy] = ptAt(ai, v);
            return (
              <g key={ai}>
                <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="7.5" fill={t.color} className="v-halo" />
                <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="5.5" fill={t.color} stroke="#000" strokeWidth="2" />
              </g>
            );
          });

          const delaySec = i === 1 ? 1.25 : 0.56;

          return (
            <g
              key={t.name}
              className="cursor-pointer"
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: mounted ? 'scale(1)' : 'scale(0)',
                opacity: mounted ? 1 : 0,
                transition: `transform 0.90s cubic-bezier(0.16, 1.12, 0.3, 1) ${delaySec}s, opacity 0.65s ease ${delaySec}s`,
              }}
              onMouseMove={(e) =>
                setTooltip({
                  text: `#${t.rank} ${t.name} — ${formatNumber(t.pts)} PTS (${t.kills} Kills • ${formatNumber(t.dmg)} DMG)`,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseLeave={() => setTooltip(null)}
              onClick={(e) =>
                onElementClick?.(e, 's6', i === 1 ? 'rank1' : 'rank2', `#${t.rank} ${t.name}`)
              }
            >
              <polygon
                points={polyStr(t.vals)}
                fill={`${t.color}42`}
                stroke={t.color}
                strokeWidth="4"
                className="neon-pulse"
                style={{ color: t.color }}
              />
              {dots}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-bold font-hud shadow-xl border border-amber-400/40"
          style={{ left: `${tooltip.x + 14}px`, top: `${tooltip.y - 38}px` }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
