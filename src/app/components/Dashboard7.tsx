'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FlameEffect from './FlameEffect';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_H2H = {
  a: { name: 'EXE', tag: 'EXE', rank: 3, surv: 5, kills: 20, total: 25, damage: 11823, hs: 16, gloo: 70 },
  b: { name: '69',  tag: '69',  rank: 6, surv: 4, kills: 12, total: 16, damage: 6390,  hs: 20, gloo: 37 },
};

const DEFAULT_COLORS = {
  teamAColor: '#8B5CF6',
  teamBColor: '#2DD4BF',
  fireColor: '#8B5CF6',
};

export default function Dashboard7({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);
  const [gridVisible, setGridVisible] = useState(false);
  const [axesVisible, setAxesVisible] = useState<boolean[]>([false, false, false, false]);
  const [polyAVisible, setPolyAVisible] = useState(false);
  const [polyBVisible, setPolyBVisible] = useState(false);
  const [arcOffsetA, setArcOffsetA] = useState(Math.PI * 115);
  const [arcOffsetB, setArcOffsetB] = useState(Math.PI * 115);
  const [pctAVal, setPctAVal] = useState(0);
  const [pctBVal, setPctBVal] = useState(0);

  const { data: themeData } = useSWR('/api/theme', fetcher, { refreshInterval: 3000 });
  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard7) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard7 });
      return;
    }
    try {
      const saved = localStorage.getItem('rtb_colors_dashboard7');
      if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
    } catch {}
  }, [overrideColors, themeData]);

  const h2h = React.useMemo(() => {
    const raw = sheetData?.data || [];
    if (raw.length >= 2) {
      const t1 = raw[0];
      const t2 = raw[1];
      const t1Tag = (t1.Code || t1.TeamName?.slice(0, 3) || 'EXE').toUpperCase();
      const t2Tag = (t2.Code || t2.TeamName?.slice(0, 3) || '69').toUpperCase();
      const t1K = parseInt(t1.Kill, 10) || DEFAULT_H2H.a.kills;
      const t1Pts = parseInt(t1.Total || t1.TotalPoints, 10) || DEFAULT_H2H.a.total;
      const t2K = parseInt(t2.Kill, 10) || DEFAULT_H2H.b.kills;
      const t2Pts = parseInt(t2.Total || t2.TotalPoints, 10) || DEFAULT_H2H.b.total;
      return {
        a: {
          name: t1Tag,
          tag: t1Tag,
          rank: 1,
          surv: parseInt(t1['Survival Score'] || t1.SurvivalScore, 10) || 8,
          kills: t1K,
          total: t1Pts,
          damage: parseInt(t1.Damage, 10) || DEFAULT_H2H.a.damage,
          hs: Math.round(t1K * 0.8) || 16,
          gloo: Math.round(t1K * 3.5) || 70,
        },
        b: {
          name: t2Tag,
          tag: t2Tag,
          rank: 2,
          surv: parseInt(t2['Survival Score'] || t2.SurvivalScore, 10) || 9,
          kills: t2K,
          total: t2Pts,
          damage: parseInt(t2.Damage, 10) || DEFAULT_H2H.b.damage,
          hs: Math.round(t2K * 0.9) || 20,
          gloo: Math.round(t2K * 3.1) || 37,
        },
      };
    }
    return DEFAULT_H2H;
  }, [sheetData]);

  const { a, b } = h2h;
  const pctA = Math.round((a.total / (a.total + b.total)) * 100) || 50;
  const pctB = 100 - pctA;
  const R = 115;
  const ARC = Math.PI * R;

  useEffect(() => {
    setGridVisible(false);
    setAxesVisible([false, false, false, false]);
    setPolyAVisible(false);
    setPolyBVisible(false);
    setArcOffsetA(ARC);
    setArcOffsetB(ARC);
    setPctAVal(0);
    setPctBVal(0);

    const timers: NodeJS.Timeout[] = [];

    // Grid reveal
    timers.push(setTimeout(() => setGridVisible(true), 120));

    // Axes reveal
    [0, 1, 2, 3].forEach((i) => {
      timers.push(
        setTimeout(() => {
          setAxesVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 420 + i * 180)
      );
    });

    // Polygon A & Arc A
    timers.push(
      setTimeout(() => {
        setPolyAVisible(true);
        setArcOffsetA(ARC * (1 - pctA / 100));

        const start = performance.now();
        const duration = 1650;
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setPctAVal(Math.round(pctA * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 750)
    );

    // Polygon B & Arc B
    timers.push(
      setTimeout(() => {
        setPolyBVisible(true);
        setArcOffsetB(ARC * (1 - pctB / 100));

        const start = performance.now();
        const duration = 1650;
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setPctBVal(Math.round(pctB * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 1550)
    );

    return () => timers.forEach(clearTimeout);
  }, [a, b, pctA, pctB, ARC]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none relative">
      {/* Background Flame Aura */}
      <div className="absolute top-6 inset-x-0 flex justify-center pointer-events-none opacity-70">
        <FlameEffect color={colors.fireColor || colors.teamAColor} height={130} opacity={0.65} />
      </div>

      <div className="w-full max-w-4xl space-y-5 relative z-10">
        {/* Top 2 Team Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skew-box hud-card border-l-4 border-l-violet-500 px-5 py-3 rounded-xl">
            <div className="unskew flex justify-between items-center">
              <div>
                <div className="text-[10px] text-violet-400 font-bold tracking-wider">
                  RANK #{a.rank}
                </div>
                <div className="font-hud text-xl font-bold text-white tracking-wide">
                  {a.tag}
                </div>
              </div>
              <div className="font-hud text-2xl font-bold text-violet-300">
                {a.total} PTS
              </div>
            </div>
          </div>

          <div className="skew-box hud-card border-r-4 border-r-teal-400 px-5 py-3 rounded-xl">
            <div className="unskew flex justify-between items-center">
              <div className="font-hud text-2xl font-bold text-teal-300">
                {b.total} PTS
              </div>
              <div className="text-right">
                <div className="text-[10px] text-teal-400 font-bold tracking-wider">
                  RANK #{b.rank}
                </div>
                <div className="font-hud text-xl font-bold text-white tracking-wide">
                  {b.tag}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Comparison Panels: Radar on Left, Semi-Circle Gauge on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Left: 4-Axis Diamond Radar */}
          <div className="hud-card rounded-2xl p-4 flex justify-center">
            <svg viewBox="0 0 280 230" className="w-full max-w-[265px] overflow-visible">
              {/* Outer & Inner Grids */}
              <polygon
                points="140,30 230,115 140,200 50,115"
                fill="rgba(9,11,18,0.8)"
                stroke="#334155"
                strokeWidth="1.5"
                style={{
                  transformOrigin: '140px 115px',
                  transform: gridVisible ? 'scale(1)' : 'scale(0)',
                  opacity: gridVisible ? 1 : 0,
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.5s',
                }}
              />
              <polygon
                points="140,58 200,115 140,172 80,115"
                fill="none"
                stroke="rgba(148,163,184,0.22)"
                style={{
                  transformOrigin: '140px 115px',
                  transform: gridVisible ? 'scale(1)' : 'scale(0)',
                  opacity: gridVisible ? 1 : 0,
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.5s',
                }}
              />
              <line x1="140" y1="30" x2="140" y2="200" stroke="rgba(148,163,184,0.16)" />
              <line x1="50" y1="115" x2="230" y2="115" stroke="rgba(148,163,184,0.16)" />

              {/* Polygon A */}
              <g
                style={{
                  transformOrigin: '140px 115px',
                  transform: polyAVisible ? 'scale(1)' : 'scale(0)',
                  opacity: polyAVisible ? 1 : 0,
                  transition:
                    'transform 1.55s cubic-bezier(0.22,1.12,0.36,1), opacity 0.7s ease',
                }}
              >
                <polygon
                  points="140,42 222,115 140,178 60,115"
                  fill="rgba(139,92,246,0.42)"
                  stroke={colors.teamAColor}
                  strokeWidth="2.8"
                />
                <circle cx="140" cy="42" r="4.5" fill={colors.teamAColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="222" cy="115" r="4.5" fill={colors.teamAColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="140" cy="178" r="4.5" fill={colors.teamAColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="60" cy="115" r="4.5" fill={colors.teamAColor} stroke="#090b10" strokeWidth="1.8" />
              </g>

              {/* Polygon B */}
              <g
                style={{
                  transformOrigin: '140px 115px',
                  transform: polyBVisible ? 'scale(1)' : 'scale(0)',
                  opacity: polyBVisible ? 1 : 0,
                  transition:
                    'transform 1.55s cubic-bezier(0.22,1.12,0.36,1), opacity 0.7s ease',
                }}
              >
                <polygon
                  points="140,68 184,115 140,192 92,115"
                  fill="rgba(45,212,191,0.32)"
                  stroke={colors.teamBColor}
                  strokeWidth="2.8"
                />
                <circle cx="140" cy="68" r="4.5" fill={colors.teamBColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="184" cy="115" r="4.5" fill={colors.teamBColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="140" cy="192" r="4.5" fill={colors.teamBColor} stroke="#090b10" strokeWidth="1.8" />
                <circle cx="92" cy="115" r="4.5" fill={colors.teamBColor} stroke="#090b10" strokeWidth="1.8" />
              </g>

              {/* Axis Labels */}
              <text
                x="140"
                y="18"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                className="font-hud"
                style={{ opacity: axesVisible[0] ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                KILLS ({a.kills} vs {b.kills})
              </text>
              <text
                x="234"
                y="118"
                textAnchor="start"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                className="font-hud"
                style={{ opacity: axesVisible[1] ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                DMG
              </text>
              <text
                x="140"
                y="218"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                className="font-hud"
                style={{ opacity: axesVisible[2] ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                HS ({a.hs} vs {b.hs})
              </text>
              <text
                x="44"
                y="118"
                textAnchor="end"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                className="font-hud"
                style={{ opacity: axesVisible[3] ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                GLOO
              </text>
            </svg>
          </div>

          {/* Right: Semi-Circle Gauge with Ratio */}
          <div className="hud-card rounded-2xl p-5 flex flex-col items-center">
            <div className="relative w-full max-w-[270px]">
              <svg viewBox="0 0 320 175" className="w-full overflow-visible">
                <path
                  d="M 45 155 A 115 115 0 0 1 275 155"
                  fill="none"
                  stroke="#0b0f19"
                  strokeWidth="30"
                />
                <path
                  className="arc-sweep"
                  d="M 45 155 A 115 115 0 0 1 275 155"
                  fill="none"
                  stroke={colors.teamAColor}
                  strokeWidth="24"
                  strokeDasharray={ARC}
                  strokeDashoffset={arcOffsetA}
                />
                <path
                  className="arc-sweep"
                  d="M 275 155 A 115 115 0 0 0 45 155"
                  fill="none"
                  stroke={colors.teamBColor}
                  strokeWidth="24"
                  strokeDasharray={ARC}
                  strokeDashoffset={arcOffsetB}
                />
              </svg>
              <div className="absolute inset-x-0 bottom-2 text-center font-hud text-2xl font-bold text-white">
                <span className="text-violet-400">{pctAVal}%</span> :{' '}
                <span className="text-teal-300">{pctBVal}%</span>
              </div>
            </div>

            {/* Bottom 3 Stats Summary */}
            <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs font-hud">
              <div>
                <div className="text-slate-400 text-[10px]">DAMAGE</div>
                <div className="font-bold text-white">
                  {(a.damage / 1000).toFixed(1)}K vs {(b.damage / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">HEADSHOTS</div>
                <div className="font-bold text-white">
                  {a.hs} vs {b.hs}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">GLOO USED</div>
                <div className="font-bold text-white">
                  {a.gloo} vs {b.gloo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
