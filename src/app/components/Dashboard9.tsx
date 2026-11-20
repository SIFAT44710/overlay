'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RadarTeam {
  name: string;
  tag: string;
  color: string;
  kills: number;
  dmg: number;
  vals: number[];
}

const DEFAULT_RADAR = {
  axes: ['KILLS', 'KNOCKDOWN', 'ASSIST', 'HEADSHOTS', 'DAMAGE'],
  teams: [
    { name: 'RAAD VAI YT', tag: 'TOP', color: '#F5B700', kills: 94, dmg: 57261, vals: [100, 100, 100, 100, 100] },
    { name: 'EXTREME EX', tag: 'EXE', color: '#6225A6', kills: 76, dmg: 42349, vals: [81, 71, 55, 75, 74] },
    { name: 'SNEAKY9X', tag: 'S9x', color: '#00DF82', kills: 62, dmg: 41088, vals: [66, 66, 36, 57, 72] },
    { name: 'COFFIN MAKERS', tag: 'CME', color: '#EC008C', kills: 58, dmg: 44026, vals: [62, 71, 38, 79, 77] },
  ],
};

const DEFAULT_COLORS = {
  team1: '#F5B700',
  team2: '#6225A6',
  team3: '#00DF82',
  team4: '#EC008C',
  axisColor: '#6225A6',
  gridColor: '#000000',
};

export default function Dashboard9({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [activeTeams, setActiveTeams] = useState<boolean[]>([false, false, false, false]);
  const [axesVisible, setAxesVisible] = useState<boolean[]>([false, false, false, false, false]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });
  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard9) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard9 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard9');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const CX = 210;
  const CY = 195;
  const maxR = 126;

  const ptAt = (axisIdx: number, pct: number) => {
    const ang = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 5;
    const r = maxR * (pct / 100);
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  };

  const polyStr = (vals: number[]) =>
    vals.map((v, i) => ptAt(i, v).map((n) => n.toFixed(1)).join(',')).join(' ');

  const rings = [25, 50, 75, 100];
  const axes = DEFAULT_RADAR.axes;

  const teamColors = [colors.team1, colors.team2, colors.team3, colors.team4];

  // Derive live top 4 teams from sheet (Live match Vmix priority, DayStanding fallback)
  const radarTeams: RadarTeam[] = React.useMemo(() => {
    // 1. Check live Vmix match standing first
    if (sheetData?.data && sheetData.data.length >= 4) {
      const top4 = sheetData.data
        .filter((r: any) => r.TeamName && r.TeamName.trim() !== '')
        .slice(0, 4);
      if (top4.length >= 4) {
        const maxKills = Math.max(1, ...top4.map((t: any) => parseInt(t.Kill, 10) || 0));
        const maxDmg = Math.max(1, ...top4.map((t: any) => parseInt(t.Damage, 10) || 0));
        const maxPts = Math.max(1, ...top4.map((t: any) => parseInt(t.Total, 10) || 0));

        return top4.map((t: any, idx: number): RadarTeam => {
          const kills = parseInt(t.Kill, 10) || 0;
          const dmg = parseInt(t.Damage, 10) || 0;
          const pts = parseInt(t.Total, 10) || 0;
          const surv = parseInt(t['Survival Score'] || t.SurvivalScore, 10) || 0;
          const booyah = parseInt(t.Booyah, 10) || 0;

          const kPct = Math.min(100, Math.round((kills / maxKills) * 100));
          const dPct = Math.min(100, Math.round((dmg / maxDmg) * 100));
          const pPct = Math.min(100, Math.round((pts / maxPts) * 100));
          const sPct = Math.min(100, Math.round((surv / 12) * 100));
          const bPct = Math.min(100, Math.round(booyah > 0 ? 100 : 35));

          const name = t.TeamName.trim();
          const tag = name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3).toUpperCase();

          return {
            name,
            tag,
            color: teamColors[idx] || DEFAULT_RADAR.teams[idx]?.color || '#F5B700',
            kills,
            dmg,
            vals: [
              Math.max(25, kPct),
              Math.max(25, sPct),
              Math.max(25, bPct),
              Math.max(25, pPct),
              Math.max(25, dPct),
            ],
          };
        });
      }
    }

    // 2. Fallback to DayStanding
    if (dayData?.success && dayData.data && dayData.data.length >= 4) {
      const top4 = dayData.data.slice(0, 4);
      const maxKills = Math.max(1, ...top4.map((t: any) => t.elims || 0));
      const maxDmg = Math.max(1, ...top4.map((t: any) => t.damage || 0));
      const maxPts = Math.max(1, ...top4.map((t: any) => t.total || 0));

      return top4.map((t: any, idx: number): RadarTeam => {
        const kPct = Math.min(100, Math.round(((t.elims || 0) / maxKills) * 100));
        const dPct = Math.min(100, Math.round(((t.damage || 0) / maxDmg) * 100));
        const pPct = Math.min(100, Math.round(((t.total || 0) / maxPts) * 100));
        const sPct = Math.min(100, Math.round(((t.place || 0) / 40) * 100));
        const bPct = Math.min(100, Math.round(((t.booyah || 0) / 2) * 100));
        return {
          name: t.name,
          tag: t.tag || t.name.slice(0, 3).toUpperCase(),
          color: teamColors[idx] || DEFAULT_RADAR.teams[idx]?.color || '#F5B700',
          kills: t.elims || 0,
          dmg: t.damage || 0,
          vals: [
            Math.max(25, kPct),
            Math.max(25, sPct),
            Math.max(25, bPct),
            Math.max(25, pPct),
            Math.max(25, dPct),
          ],
        };
      });
    }
    return DEFAULT_RADAR.teams;
  }, [sheetData, dayData, teamColors]);

  useEffect(() => {
    setActiveTeams([false, false, false, false]);
    setAxesVisible([false, false, false, false, false]);

    const timers: NodeJS.Timeout[] = [];

    // 1. Team 0 (Gold) scales in first
    timers.push(
      setTimeout(() => {
        setActiveTeams((prev) => [true, prev[1], prev[2], prev[3]]);
      }, 250)
    );

    // 2. Axes appear one by one
    axes.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setAxesVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 900 + i * 240)
      );
    });

    // 3. Teams 1, 2, 3 enter sequentially
    [1, 2, 3].forEach((idx, i) => {
      timers.push(
        setTimeout(() => {
          setActiveTeams((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, 2200 + i * 800)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-transparent select-none">
      <div className="w-full flex flex-col items-center justify-center">
        <svg viewBox="0 0 420 390" className="w-full max-w-[460px] overflow-visible">
          {/* Concentric Polygonal Grid Rings */}
          {rings.map((p) => (
            <polygon
              key={p}
              points={polyStr([p, p, p, p, p])}
              fill="none"
              stroke={colors.gridColor}
              strokeOpacity={p === 100 ? 0.75 : 0.28}
              strokeWidth={p === 100 ? 1.8 : 1.1}
            />
          ))}

          {/* Spokes and Labels */}
          {axes.map((lbl, i) => {
            const [x2, y2] = ptAt(i, 100);
            const [lx, ly] = ptAt(i, 126);
            return (
              <g key={i}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x2.toFixed(1)}
                  y2={y2.toFixed(1)}
                  stroke={colors.gridColor}
                  strokeOpacity={0.3}
                  strokeWidth={1.1}
                />
                <text
                  x={lx.toFixed(1)}
                  y={(ly + 4).toFixed(1)}
                  textAnchor="middle"
                  fill={colors.axisColor}
                  fontSize="12.5"
                  fontWeight="800"
                  className="font-num"
                  style={{
                    opacity: axesVisible[i] ? 1 : 0,
                    transition: 'opacity 0.55s ease',
                  }}
                >
                  {lbl}
                </text>
              </g>
            );
          })}

          {/* Team Radar Polygons */}
          {radarTeams.map((t: RadarTeam, i: number) => {
            const col = teamColors[i] || t.color;
            const isShown = activeTeams[i];
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${t.name} — ${t.kills} Kills • ${t.dmg.toLocaleString()} DMG`,
                  })
                }
                onMouseMove={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${t.name} — ${t.kills} Kills • ${t.dmg.toLocaleString()} DMG`,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
                style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform: isShown ? 'scale(1)' : 'scale(0)',
                  opacity: isShown ? 1 : 0,
                  transition:
                    'transform 1.1s cubic-bezier(0.22, 1.12, 0.36, 1), opacity 0.6s ease',
                }}
              >
                <polygon
                  points={polyStr(t.vals)}
                  fill={`${col}33`}
                  stroke={col}
                  strokeWidth="3"
                />
                {t.vals.map((v: number, ai: number) => {
                  const [dx, dy] = ptAt(ai, v);
                  return (
                    <g key={ai}>
                      <circle
                        cx={dx.toFixed(1)}
                        cy={dy.toFixed(1)}
                        r="7"
                        fill={col}
                        className="node-halo"
                      />
                      <circle
                        cx={dx.toFixed(1)}
                        cy={dy.toFixed(1)}
                        r="4.5"
                        fill={col}
                        stroke="#000000"
                        strokeWidth="1.8"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {radarTeams.map((t: RadarTeam, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-sm border-2 border-black"
                style={{ backgroundColor: teamColors[i] }}
              />
              <span className="font-title text-xs font-bold text-black">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold font-num shadow-xl border-2 border-[#6225A6]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 34 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
