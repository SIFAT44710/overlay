'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ROLES = [
  { name: 'Rusher', color: '#38BDF8' },
  { name: 'Support', color: '#E11D48' },
  { name: 'Sniper', color: '#F5B700' },
  { name: 'Bomber', color: '#A78BFA' },
];

const DEFAULT_KILLS = [10.3, 10.3, 10.4, 11.7];
const DEFAULT_DAMAGE = [6037, 6207, 9175, 6545];

const DEFAULT_COLORS = {
  headerKills: '#2DD4BF', // Teal
  headerDamage: '#F59E0B', // Amber
  fireColor: '#8B5CF6',
  cardBg: 'rgba(9, 11, 18, 0.78)',
};

export default function Dashboard14({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [animated, setAnimated] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    value: string;
  } | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard14) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard14 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard14');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 180);
    return () => clearTimeout(t);
  }, []);

  // Polar coordinates builder for 4 equal quadrants (90 deg each)
  const CX = 140;
  const CY = 140;
  const maxR = 105;

  const renderPolarWedges = (
    values: number[],
    maxValue: number,
    isKills: boolean
  ) => {
    const angleStep = (2 * Math.PI) / 4; // 4 roles
    return values.map((val, idx) => {
      const role = ROLES[idx];
      const radiusPct = val / maxValue;
      const targetR = maxR * (0.35 + 0.65 * radiusPct);
      const r = animated ? targetR : 10;

      const startAngle = idx * angleStep - Math.PI / 2;
      const endAngle = (idx + 1) * angleStep - Math.PI / 2;

      const x1 = CX + r * Math.cos(startAngle);
      const y1 = CY + r * Math.sin(startAngle);
      const x2 = CX + r * Math.cos(endAngle);
      const y2 = CY + r * Math.sin(endAngle);

      // SVG pie sector path
      const path = `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(
        1
      )} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;

      // Label coordinate outside sector
      const midAngle = startAngle + angleStep / 2;
      const labelR = targetR * 0.62;
      const lx = CX + labelR * Math.cos(midAngle);
      const ly = CY + labelR * Math.sin(midAngle);

      return (
        <g
          key={role.name}
          className="cursor-pointer transition-all duration-700 hover:opacity-90"
          onMouseEnter={(e) => {
            const rect = (e.target as SVGElement).getBoundingClientRect();
            setActiveTooltip({
              x: rect.left + rect.width / 2,
              y: rect.top,
              title: `${role.name} (${isKills ? 'Avg Kills' : 'Avg Damage'})`,
              value: isKills ? `${val.toFixed(1)} Kills` : `${val.toLocaleString()} DMG`,
            });
          }}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <path
            d={path}
            fill={`${role.color}cc`}
            stroke="#0f172a"
            strokeWidth="2.5"
            style={{
              transition: `all 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s`,
            }}
          />
          {animated && (
            <text
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="900"
              className="font-hud pointer-events-none drop-shadow"
            >
              {isKills ? val.toFixed(1) : `${Math.round(val / 1000)}k`}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-center p-4 bg-transparent select-none font-sans overflow-hidden">
      {/* Background Fire Flame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-75">
        <FlameEffect color={colors.fireColor || '#8B5CF6'} height={480} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Role Legend Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {ROLES.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black text-white font-hud shadow-lg border border-black/30"
              style={{ backgroundColor: r.color }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{r.name.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* 2 Polar Canvas Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Chart: AVG KILLS */}
          <div
            className="hud-card rounded-2xl p-6 flex flex-col items-center backdrop-blur-md border shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: 'rgba(148, 163, 184, 0.2)',
            }}
          >
            <div
              className="font-hud text-xs font-black tracking-widest mb-3 uppercase"
              style={{ color: colors.headerKills }}
            >
              ROLE AVERAGE KILLS
            </div>

            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
                {/* Concentric Guide Circles */}
                {[0.25, 0.5, 0.75, 1].map((s) => (
                  <circle
                    key={s}
                    cx={CX}
                    cy={CY}
                    r={maxR * s}
                    fill="none"
                    stroke="rgba(226,232,240,0.14)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
                {renderPolarWedges(DEFAULT_KILLS, 12, true)}
              </svg>
            </div>
          </div>

          {/* Right Chart: AVG DAMAGE */}
          <div
            className="hud-card rounded-2xl p-6 flex flex-col items-center backdrop-blur-md border shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: 'rgba(148, 163, 184, 0.2)',
            }}
          >
            <div
              className="font-hud text-xs font-black tracking-widest mb-3 uppercase"
              style={{ color: colors.headerDamage }}
            >
              ROLE AVERAGE DAMAGE
            </div>

            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
                {/* Concentric Guide Circles */}
                {[0.25, 0.5, 0.75, 1].map((s) => (
                  <circle
                    key={s}
                    cx={CX}
                    cy={CY}
                    r={maxR * s}
                    fill="none"
                    stroke="rgba(226,232,240,0.14)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
                {renderPolarWedges(DEFAULT_DAMAGE, 10000, false)}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {activeTooltip && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-white/20 text-white font-hud text-xs font-bold shadow-2xl -translate-x-1/2 -translate-y-full"
          style={{ left: activeTooltip.x, top: activeTooltip.y - 10 }}
        >
          <div className="text-[10px] text-slate-400 font-extrabold uppercase">
            {activeTooltip.title}
          </div>
          <div className="text-amber-400 font-black mt-0.5">{activeTooltip.value}</div>
        </div>
      )}
    </div>
  );
}
