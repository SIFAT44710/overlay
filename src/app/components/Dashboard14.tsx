'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RolePolarData {
  role: string;
  color: string;
  kills: number;
  damage: number;
}

const ROLES_DATA: RolePolarData[] = [
  { role: 'Rusher',  color: '#EF4444', kills: 10.3, damage: 6037 },
  { role: 'Support', color: '#22C55E', kills: 10.3, damage: 6207 },
  { role: 'Sniper',  color: '#A855F7', kills: 10.4, damage: 9175 },
  { role: 'Bomber',  color: '#FACC15', kills: 11.7, damage: 6545 },
];

export default function Dashboard14({ overrideColors }: { overrideColors?: any } = {}) {
  const [animated, setAnimated] = useState(false);
  const [fireActiveA, setFireActiveA] = useState(false);
  const [fireActiveB, setFireActiveB] = useState(false);
  const [hoveredRoleA, setHoveredRoleA] = useState<RolePolarData | null>(null);
  const [hoveredRoleB, setHoveredRoleB] = useState<RolePolarData | null>(null);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });

  useEffect(() => {
    const tAnim = setTimeout(() => setAnimated(true), 150);
    const tFireA = setTimeout(() => setFireActiveA(true), 380);
    const tFireB = setTimeout(() => setFireActiveB(true), 550);

    return () => {
      clearTimeout(tAnim);
      clearTimeout(tFireA);
      clearTimeout(tFireB);
    };
  }, []);

  const CX = 140;
  const CY = 140;
  const MAX_R = 105;
  const maxK = 13;
  const maxD = 10500;

  // Polar wedge helper for 4 equal 90-deg quadrants
  const renderWedges = (
    valKey: 'kills' | 'damage',
    maxVal: number,
    onHover: (r: RolePolarData | null) => void
  ) => {
    const stepAngle = (2 * Math.PI) / 4;
    return ROLES_DATA.map((r, i) => {
      const val = r[valKey];
      const radiusPct = val / maxVal;
      const targetR = MAX_R * (0.35 + 0.65 * radiusPct);
      const radius = animated ? targetR : 12;

      const startAngle = i * stepAngle - Math.PI / 2;
      const endAngle = (i + 1) * stepAngle - Math.PI / 2;

      const x1 = CX + radius * Math.cos(startAngle);
      const y1 = CY + radius * Math.sin(startAngle);
      const x2 = CX + radius * Math.cos(endAngle);
      const y2 = CY + radius * Math.sin(endAngle);

      const path = `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius.toFixed(
        1
      )} ${radius.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;

      const midAngle = startAngle + stepAngle / 2;
      const lx = CX + radius * 0.62 * Math.cos(midAngle);
      const ly = CY + radius * 0.62 * Math.sin(midAngle);

      return (
        <g
          key={r.role}
          className="cursor-pointer transition-all duration-700"
          onMouseEnter={() => onHover(r)}
          onMouseLeave={() => onHover(null)}
        >
          <path
            d={path}
            fill={`${r.color}d9`}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            style={{
              transition: 'd 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <text
            x={lx}
            y={ly + 3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="800"
            className="font-hud pointer-events-none"
            style={{
              paintOrder: 'stroke',
              stroke: '#090b10',
              strokeWidth: '3px',
            }}
          >
            {valKey === 'kills' ? val : (val / 1000).toFixed(1) + 'K'}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Polar Chart: AVG KILLS */}
        <div className="hud-card rounded-2xl p-5 flex flex-col items-center">
          {/* Top Badge */}
          <div
            className={`mb-3 px-3.5 py-1 rounded-xl bg-transparent border border-purple-400 font-hud text-xs font-extrabold text-white flex items-center gap-2 relative transition-all duration-500 ${
              fireActiveA ? 'top1-hero-glow top1-scale opacity-100' : 'opacity-0'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {fireActiveA && (
              <div
                className="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 opacity-100"
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10 text-yellow-400">#1 AVG KILLS</span>
            <span className="relative z-10">BOMBER • 11.7</span>
          </div>

          {/* Polar SVG */}
          <div className="relative w-full max-w-[280px]">
            <svg viewBox="0 0 280 280" className="w-full overflow-visible">
              {/* Background circular rings */}
              {[30, 60, 90, 115].map((r) => (
                <circle
                  key={r}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="rgba(226,232,240,0.18)"
                  strokeWidth="1"
                />
              ))}

              {/* Polar Wedges */}
              {renderWedges('kills', maxK, setHoveredRoleA)}

              {/* Role Names on Margins */}
              <text x={CX} y="18" textAnchor="middle" fill="#EF4444" fontSize="10.5" fontWeight="800" className="font-hud">RUSHER</text>
              <text x="265" y={CY + 4} textAnchor="start" fill="#22C55E" fontSize="10.5" fontWeight="800" className="font-hud">SUPPORT</text>
              <text x={CX} y="268" textAnchor="middle" fill="#A855F7" fontSize="10.5" fontWeight="800" className="font-hud">SNIPER</text>
              <text x="15" y={CY + 4} textAnchor="end" fill="#FACC15" fontSize="10.5" fontWeight="800" className="font-hud">BOMBER</text>
            </svg>

            {hoveredRoleA && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-3 py-1 rounded bg-slate-950/95 border border-white/20 text-white font-hud text-xs font-bold shadow">
                  {hoveredRoleA.role}: {hoveredRoleA.kills} Kills
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Polar Chart: AVG DAMAGE */}
        <div className="hud-card rounded-2xl p-5 flex flex-col items-center">
          {/* Top Badge */}
          <div
            className={`mb-3 px-3.5 py-1 rounded-xl bg-transparent border border-purple-400 font-hud text-xs font-extrabold text-white flex items-center gap-2 relative transition-all duration-500 ${
              fireActiveB ? 'top1-hero-glow top1-scale opacity-100' : 'opacity-0'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {fireActiveB && (
              <div
                className="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 opacity-100"
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10 text-purple-400">#1 AVG DAMAGE</span>
            <span className="relative z-10">SNIPER • 9,175</span>
          </div>

          {/* Polar SVG */}
          <div className="relative w-full max-w-[280px]">
            <svg viewBox="0 0 280 280" className="w-full overflow-visible">
              {/* Background circular rings */}
              {[30, 60, 90, 115].map((r) => (
                <circle
                  key={r}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="rgba(226,232,240,0.18)"
                  strokeWidth="1"
                />
              ))}

              {/* Polar Wedges */}
              {renderWedges('damage', maxD, setHoveredRoleB)}

              {/* Role Names on Margins */}
              <text x={CX} y="18" textAnchor="middle" fill="#EF4444" fontSize="10.5" fontWeight="800" className="font-hud">RUSHER</text>
              <text x="265" y={CY + 4} textAnchor="start" fill="#22C55E" fontSize="10.5" fontWeight="800" className="font-hud">SUPPORT</text>
              <text x={CX} y="268" textAnchor="middle" fill="#A855F7" fontSize="10.5" fontWeight="800" className="font-hud">SNIPER</text>
              <text x="15" y={CY + 4} textAnchor="end" fill="#FACC15" fontSize="10.5" fontWeight="800" className="font-hud">BOMBER</text>
            </svg>

            {hoveredRoleB && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-3 py-1 rounded bg-slate-950/95 border border-white/20 text-white font-hud text-xs font-bold shadow">
                  {hoveredRoleB.role}: {hoveredRoleB.damage.toLocaleString()} DMG
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
