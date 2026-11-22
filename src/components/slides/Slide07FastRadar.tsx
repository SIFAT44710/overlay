'use client';

import React, { useEffect, useState } from 'react';
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
  const source = theme?.sources?.[6] || 'day_top2_radar';

  const allTeams = sheetData?.allTeamsFull || [];
  let teamA = allTeams[0] || {
    rank: 1,
    name: 'RAAD VAI YT',
    tag: 'TOP',
    total: 134,
    kills: 94,
    damage: 57261,
    hs: 89,
    gloo: 297,
  };
  let teamB = allTeams[1] || {
    rank: 2,
    name: 'EXTREME EX',
    tag: 'EXE',
    total: 98,
    kills: 76,
    damage: 42349,
    hs: 67,
    gloo: 340,
  };

  if (source === 'custom_radar_h2h' && allTeams.length >= 2) {
    teamA = allTeams[custom?.rAIdx ?? 0] || allTeams[0];
    teamB = allTeams[custom?.rBIdx ?? 1] || allTeams[1];
  }

  // Resolve Drive Logo for both teams
  const teamLogoMap: Record<string, string> = {};
  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => {
      if (st.logoUrl) {
        teamLogoMap[st.tag.toUpperCase()] = st.logoUrl;
        teamLogoMap[st.name.toUpperCase()] = st.logoUrl;
      }
    });
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

  const CX = 280;
  const CY = 265;
  const maxR = 192;

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
          className="px-4 py-1.5 rounded-xl dark-box font-hud text-2xl sm:text-3xl font-bold text-white inline-flex items-center gap-3.5 border-l-4 relative shadow-xl cursor-pointer"
          style={{
            borderLeftColor: themeS6.rank1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.4s ease 1.25s, transform 0.4s ease 1.25s',
          }}
          onClick={(e) => onElementClick?.(e, 's6', 'rank1', `#${teamA.rank} ${teamA.name}`)}
        >
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={teamA.tag}
            name={teamA.name}
            logoUrl={teamLogoMap[teamA.tag.toUpperCase()] || teamLogoMap[teamA.name.toUpperCase()]}
            color={themeS6.rank1}
            sizeCls="w-16 h-16"
          />
          <span>
            #{teamA.rank} {teamA.name}
          </span>
          <span
            className="px-3 py-0.5 rounded text-white text-2xl sm:text-3xl"
            style={{ backgroundColor: themeS6.rank1 }}
          >
            {formatNumber(teamA.total)} PTS
          </span>
        </div>

        <span className="px-4 py-1 rounded-full bg-amber-400 text-black font-hud text-2xl font-bold shadow-lg">
          VS
        </span>

        {/* Team B Pill */}
        <div
          id="t2-pill-b"
          className="px-4 py-1.5 rounded-xl dark-box font-hud text-2xl sm:text-3xl font-bold text-white inline-flex items-center gap-3.5 border-r-4 shadow-xl cursor-pointer"
          style={{
            borderRightColor: themeS6.rank2,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.4s ease 0.56s, transform 0.4s ease 0.56s',
          }}
          onClick={(e) => onElementClick?.(e, 's6', 'rank2', `#${teamB.rank} ${teamB.name}`)}
        >
          <span
            className="px-3 py-0.5 rounded text-white text-2xl sm:text-3xl"
            style={{ backgroundColor: themeS6.rank2 }}
          >
            {formatNumber(teamB.total)} PTS
          </span>
          <span>
            #{teamB.rank} {teamB.name}
          </span>
          <TeamLogoBadge
            tag={teamB.tag}
            name={teamB.name}
            logoUrl={teamLogoMap[teamB.tag.toUpperCase()] || teamLogoMap[teamB.name.toUpperCase()]}
            color={themeS6.rank2}
            sizeCls="w-16 h-16"
          />
        </div>
      </div>

      {/* Radar SVG with overflow-visible to ensure no text clipping */}
      <svg viewBox="0 0 560 535" className="w-full max-w-[620px] overflow-visible">
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
              transition: `transform 0.36s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s, opacity 0.28s ease`,
            }}
          />
        ))}

        {/* Radar Spokes & Axis Text Labels */}
        {axes.map((lbl, i) => {
          const [x2, y2] = ptAt(i, 100);
          const [lx, ly] = ptAt(i, 118);
          return (
            <g key={lbl}>
              <line
                x1={CX}
                y1={CY}
                x2={x2.toFixed(1)}
                y2={y2.toFixed(1)}
                stroke="rgba(226,232,240,0.24)"
                strokeWidth="1.4"
              />
              <text
                x={lx.toFixed(1)}
                y={(ly + 6).toFixed(1)}
                textAnchor="middle"
                fill="#ffffff"
                stroke="rgba(9,11,18,0.96)"
                strokeWidth="3.5"
                paintOrder="stroke fill"
                fontSize="20"
                fontWeight="800"
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
                transition: `transform 0.65s cubic-bezier(0.16, 1.12, 0.3, 1) ${delaySec}s, opacity 0.4s ease ${delaySec}s`,
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
