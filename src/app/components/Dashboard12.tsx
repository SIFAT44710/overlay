'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contender {
  rank: number;
  name: string;
  tag: string;
  color: string;
  pts: number;
  kills: number;
  dmg: number;
  vals: number[];
}

const DEFAULT_TOP2: Contender[] = [
  { rank: 2, name: 'EXTREME EX', tag: 'EXE', color: '#A78BFA', pts: 98,  kills: 76, dmg: 42349, vals: [81, 74, 75, 55, 71] },
  { rank: 1, name: 'RAAD VAI YT', tag: 'TOP', color: '#E11D48', pts: 134, kills: 94, dmg: 57261, vals: [100, 100, 100, 100, 100] },
];

const AXES = ['KILLS', 'DAMAGE', 'HEADSHOTS', 'ASSIST', 'KNOCKDOWN'];

export default function Dashboard12({ overrideColors }: { overrideColors?: any } = {}) {
  const [ringsVisible, setRingsVisible] = useState<boolean[]>([false, false, false, false]);
  const [axesVisible, setAxesVisible] = useState<boolean[]>([false, false, false, false, false]);
  const [poly0Visible, setPoly0Visible] = useState(false);
  const [poly1Visible, setPoly1Visible] = useState(false);
  const [bannerState, setBannerState] = useState<{
    text: string;
    bg: string;
    fire: boolean;
  } | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const top2: Contender[] = React.useMemo(() => {
    const list = dayData?.standing || sheetData?.data || [];
    if (list.length >= 2) {
      const t1 = list[0];
      const t2 = list[1];
      const t1Tag = t1.tag || (t1.TeamName ? t1.TeamName.slice(0, 3).toUpperCase() : 'TOP');
      const t2Tag = t2.tag || (t2.TeamName ? t2.TeamName.slice(0, 3).toUpperCase() : 'EXE');
      const t1Pts = parseInt(t1.total ?? t1.Total ?? 134, 10);
      const t2Pts = parseInt(t2.total ?? t2.Total ?? 98, 10);
      const t1K = parseInt(t1.elims ?? t1.Kill ?? 94, 10);
      const t2K = parseInt(t2.elims ?? t2.Kill ?? 76, 10);
      const t1D = parseInt(t1.damage ?? t1.Damage ?? 57261, 10);
      const t2D = parseInt(t2.damage ?? t2.Damage ?? 42349, 10);

      const kRatio = Math.min(100, Math.round((t2K / Math.max(1, t1K)) * 100));
      const dRatio = Math.min(100, Math.round((t2D / Math.max(1, t1D)) * 100));

      return [
        {
          rank: 2,
          name: t2.name || t2.TeamName || t2Tag,
          tag: t2Tag,
          color: '#A78BFA',
          pts: t2Pts,
          kills: t2K,
          dmg: t2D,
          vals: [kRatio, dRatio, 75, 55, 71],
        },
        {
          rank: 1,
          name: t1.name || t1.TeamName || t1Tag,
          tag: t1Tag,
          color: '#E11D48',
          pts: t1Pts,
          kills: t1K,
          dmg: t1D,
          vals: [100, 100, 100, 100, 100],
        },
      ];
    }
    return DEFAULT_TOP2;
  }, [dayData, sheetData]);

  const CX = 210;
  const CY = 195;
  const maxR = 128;

  const ptAt = (axisIdx: number, pct: number): [number, number] => {
    const ang = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 5;
    const r = maxR * (pct / 100);
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  };

  const polyStr = (vals: number[]) =>
    vals.map((v, i) => ptAt(i, v).map((n) => n.toFixed(1)).join(',')).join(' ');

  useEffect(() => {
    // Step 1: Rings scale in from center (120 + idx * 180ms)
    [0, 1, 2, 3].forEach((idx) => {
      setTimeout(() => {
        setRingsVisible((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, 120 + idx * 180);
    });

    // Step 2: 5 Axis labels appear smoothly (700 + i * 240ms)
    AXES.forEach((_, i) => {
      setTimeout(() => {
        setAxesVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 700 + i * 240);
    });

    // Step 3: Rank 2 EXTREME EX enters at 1950ms
    const tP0 = setTimeout(() => {
      setPoly0Visible(true);
      setBannerState({
        text: `RANK #2 — ${top2[0].name} (${top2[0].pts} PTS)`,
        bg: '#7C3AED',
        fire: false,
      });
    }, 1950);

    // Step 4: Rank 1 RAAD VAI YT sweeps out at 4200ms with Light Fire aura!
    const tP1 = setTimeout(() => {
      setPoly1Visible(true);
      setBannerState({
        text: `RANK #1 — ${top2[1].name} (${top2[1].pts} PTS)`,
        bg: '#E11D48',
        fire: true,
      });
    }, 4200);

    return () => {
      clearTimeout(tP0);
      clearTimeout(tP1);
    };
  }, [top2]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Dynamic Top Banner */}
        <div className="h-10 mb-2 flex items-center justify-center">
          {bannerState && (
            <div
              className={`px-4 py-1.5 rounded-full font-hud font-extrabold text-white tracking-wider uppercase shadow-xl transition-all duration-500 relative ${
                bannerState.fire ? 'text-sm px-5 py-2 top1-hero-glow top1-scale' : 'text-xs'
              }`}
              style={{ backgroundColor: bannerState.bg, isolation: 'isolate' }}
            >
              {bannerState.fire && (
                <div
                  className="pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 opacity-100"
                  style={{ zIndex: -1 }}
                >
                  <RealFireCanvas opts={{ light: true }} />
                </div>
              )}
              <span className="relative z-10">{bannerState.text}</span>
            </div>
          )}
        </div>

        {/* 5-Axis Radar SVG */}
        <svg viewBox="0 0 420 390" className="w-full max-w-[430px] overflow-visible">
          {/* Concentric rings */}
          {[25, 50, 75, 100].map((p, idx) => (
            <polygon
              key={p}
              points={polyStr([p, p, p, p, p])}
              fill="none"
              stroke={p === 100 ? 'rgba(226,232,240,0.55)' : 'rgba(226,232,240,0.22)'}
              strokeWidth={p === 100 ? 2 : 1.2}
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: ringsVisible[idx] ? 'scale(1)' : 'scale(0)',
                opacity: ringsVisible[idx] ? 1 : 0,
                transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
              }}
            />
          ))}

          {/* Spokes & Axis labels */}
          {AXES.map((lbl, i) => {
            const [x2, y2] = ptAt(i, 100);
            const [lx, ly] = ptAt(i, 125);
            return (
              <g key={lbl}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x2.toFixed(1)}
                  y2={y2.toFixed(1)}
                  stroke="rgba(226,232,240,0.22)"
                />
                <text
                  x={lx.toFixed(1)}
                  y={(ly + 4).toFixed(1)}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12.5"
                  fontWeight="800"
                  className="font-hud"
                  style={{
                    paintOrder: 'stroke',
                    stroke: '#090b10',
                    strokeWidth: '4px',
                    opacity: axesVisible[i] ? 1 : 0,
                    transition: 'opacity 0.65s ease',
                  }}
                >
                  {lbl}
                </text>
              </g>
            );
          })}

          {/* Rank 2 Polygon (EXE) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() =>
              setTooltip(
                `#2 ${top2[0].name} — ${top2[0].pts} PTS (${top2[0].kills} Kills • ${top2[0].dmg.toLocaleString()} DMG)`
              )
            }
            onMouseLeave={() => setTooltip(null)}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: poly0Visible ? 'scale(1)' : 'scale(0)',
              opacity: poly0Visible ? 1 : 0,
              transition:
                'transform 1.9s cubic-bezier(0.16, 1.12, 0.3, 1), opacity 0.85s ease',
            }}
          >
            <polygon
              points={polyStr(top2[0].vals)}
              fill={`${top2[0].color}38`}
              stroke={top2[0].color}
              strokeWidth="3.8"
              className="neon-pulse"
              style={{ color: top2[0].color }}
            />
            <polygon
              points={polyStr(top2[0].vals)}
              fill="none"
              stroke={top2[0].color}
              strokeWidth="2.6"
              className="wire-flow"
              style={{ filter: `drop-shadow(0 0 8px ${top2[0].color})` }}
            />
            {top2[0].vals.map((v, ai) => {
              const [dx, dy] = ptAt(ai, v);
              return (
                <g key={ai}>
                  <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="7" fill={top2[0].color} className="v-halo" />
                  <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="5" fill={top2[0].color} stroke="#000" strokeWidth="2" />
                </g>
              );
            })}
          </g>

          {/* Rank 1 Polygon (TOP) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() =>
              setTooltip(
                `#1 ${top2[1].name} — ${top2[1].pts} PTS (${top2[1].kills} Kills • ${top2[1].dmg.toLocaleString()} DMG)`
              )
            }
            onMouseLeave={() => setTooltip(null)}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: poly1Visible ? 'scale(1.03)' : 'scale(0)',
              opacity: poly1Visible ? 1 : 0,
              transition:
                'transform 1.9s cubic-bezier(0.16, 1.12, 0.3, 1), opacity 0.85s ease',
            }}
          >
            <polygon
              points={polyStr(top2[1].vals)}
              fill={`${top2[1].color}38`}
              stroke={top2[1].color}
              strokeWidth="3.8"
              className="neon-pulse"
              style={{ color: top2[1].color }}
            />
            <polygon
              points={polyStr(top2[1].vals)}
              fill="none"
              stroke={top2[1].color}
              strokeWidth="2.6"
              className="wire-flow"
              style={{ filter: `drop-shadow(0 0 8px ${top2[1].color})`, animationDelay: '0.7s' }}
            />
            {top2[1].vals.map((v, ai) => {
              const [dx, dy] = ptAt(ai, v);
              return (
                <g key={ai}>
                  <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="7" fill={top2[1].color} className="v-halo" />
                  <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="5" fill={top2[1].color} stroke="#000" strokeWidth="2" />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Readout */}
        {tooltip && (
          <div className="mt-2 px-4 py-1.5 rounded-lg bg-slate-950/95 border border-purple-400/50 text-white font-hud text-xs font-bold shadow-xl">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
}
