'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface H2HTeam {
  name: string;
  tag: string;
  rank: number;
  surv: number;
  kills: number;
  total: number;
  damage: number;
  hs: number;
  gloo: number;
}

const DEFAULT_H2H: { a: H2HTeam; b: H2HTeam } = {
  a: { name: 'EXTREME EX',  tag: 'EXE', rank: 3, surv: 5, kills: 20, total: 25, damage: 11823, hs: 16, gloo: 70 },
  b: { name: '69 ESPORTS',  tag: '69',  rank: 6, surv: 4, kills: 12, total: 16, damage: 6390,  hs: 20, gloo: 37 },
};

export default function Dashboard7({ overrideColors }: { overrideColors?: any } = {}) {
  const [step, setStep] = useState(0);
  const [axesVisible, setAxesVisible] = useState<boolean[]>([false, false, false, false]);
  const [dispP1, setDispP1] = useState(0);
  const [dispP2, setDispP2] = useState(0);
  const [fireActive, setFireActive] = useState(false);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

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
          surv: parseInt(t1['Survival Score'] || t1.SurvivalScore, 10) || 5,
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
          surv: parseInt(t2['Survival Score'] || t2.SurvivalScore, 10) || 4,
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
  const pctA = Math.round((a.total / (a.total + b.total)) * 100) || 61;
  const pctB = 100 - pctA;
  const R = 115;
  const ARC = Math.PI * R;
  const winnerSide = a.total >= b.total ? 'a' : 'b';

  useEffect(() => {
    // 120ms: grid 2
    const tG2 = setTimeout(() => setStep(1), 120);
    // 280ms: grid 1
    const tG1 = setTimeout(() => setStep(2), 280);

    // 420 + i * 180ms: axes labels
    const axTimers = [0, 1, 2, 3].map((i) =>
      setTimeout(() => {
        setAxesVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 420 + i * 180)
    );

    // 750ms: Polygon A + Arc 1 + Winner Card Fire
    const tA = setTimeout(() => {
      setStep(3);
      setFireActive(true);
      const start = performance.now();
      const dur = 1650;
      const stepTween = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setDispP1(Math.round(pctA * eased));
        if (t < 1) requestAnimationFrame(stepTween);
      };
      requestAnimationFrame(stepTween);
    }, 750);

    // 1550ms: Polygon B + Arc 2
    const tB = setTimeout(() => {
      setStep(4);
      const start = performance.now();
      const dur = 1650;
      const stepTween = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setDispP2(Math.round(pctB * eased));
        if (t < 1) requestAnimationFrame(stepTween);
      };
      requestAnimationFrame(stepTween);
    }, 1550);

    return () => {
      clearTimeout(tG2);
      clearTimeout(tG1);
      clearTimeout(tA);
      clearTimeout(tB);
      axTimers.forEach(clearTimeout);
    };
  }, [pctA, pctB]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-5">
        {/* Top 2 Team Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card A */}
          <div
            className={`skew-box hud-card border-l-4 border-l-violet-500 px-5 py-3 rounded-xl relative transition-all duration-500 ${
              winnerSide === 'a' && fireActive ? 'top1-hero-glow' : ''
            }`}
            style={{
              isolation: 'isolate',
              transform:
                winnerSide === 'a' && fireActive
                  ? 'skewX(-10deg) scale(1.045)'
                  : 'skewX(-10deg)',
            }}
          >
            {winnerSide === 'a' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <div className="unskew flex justify-between items-center">
              <div>
                <div className="text-[10px] text-violet-400 font-bold">RANK #{a.rank}</div>
                <div className="font-hud text-xl font-bold text-white">{a.name}</div>
              </div>
              <div className="font-hud text-2xl font-bold text-violet-300">{a.total} PTS</div>
            </div>
          </div>

          {/* Card B */}
          <div
            className={`skew-box hud-card border-r-4 border-r-teal-400 px-5 py-3 rounded-xl relative transition-all duration-500 ${
              winnerSide === 'b' && fireActive ? 'top1-hero-glow' : ''
            }`}
            style={{
              isolation: 'isolate',
              transform:
                winnerSide === 'b' && fireActive
                  ? 'skewX(-10deg) scale(1.045)'
                  : 'skewX(-10deg)',
            }}
          >
            {winnerSide === 'b' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <div className="unskew flex justify-between items-center">
              <div className="font-hud text-2xl font-bold text-teal-300">{b.total} PTS</div>
              <div className="text-right">
                <div className="text-[10px] text-teal-400 font-bold">RANK #{b.rank}</div>
                <div className="font-hud text-xl font-bold text-white">{b.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left Tactical Diamond Radar, Right Semi-Circle Clash Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Left: Diamond Radar */}
          <div className="hud-card rounded-2xl p-4 flex justify-center">
            <svg viewBox="0 0 280 230" className="w-full max-w-[265px] overflow-visible">
              <polygon
                points="140,30 230,115 140,200 50,115"
                fill="none"
                stroke="rgba(192,132,252,0.35)"
                strokeWidth="1.5"
                style={{
                  transformOrigin: '140px 115px',
                  transform: step >= 2 ? 'scale(1)' : 'scale(0)',
                  opacity: step >= 2 ? 1 : 0,
                  transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s',
                }}
              />
              <polygon
                points="140,58 200,115 140,172 80,115"
                fill="none"
                stroke="rgba(148,163,184,0.22)"
                style={{
                  transformOrigin: '140px 115px',
                  transform: step >= 1 ? 'scale(1)' : 'scale(0)',
                  opacity: step >= 1 ? 1 : 0,
                  transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s',
                }}
              />
              <line x1="140" y1="30" x2="140" y2="200" stroke="rgba(148,163,184,0.16)" />
              <line x1="50" y1="115" x2="230" y2="115" stroke="rgba(148,163,184,0.16)" />

              {/* Polygon Team A (Violet) */}
              <g
                style={{
                  transformOrigin: '140px 115px',
                  transform: step >= 3 ? 'scale(1)' : 'scale(0)',
                  opacity: step >= 3 ? 1 : 0,
                  transition:
                    'transform 1.55s cubic-bezier(0.22, 1.12, 0.36, 1), opacity 0.7s ease',
                }}
              >
                <polygon
                  points="140,42 222,115 140,178 60,115"
                  fill="rgba(139,92,246,0.38)"
                  stroke="#a78bfa"
                  strokeWidth="3"
                  className="neon-pulse"
                  style={{ color: '#a78bfa' }}
                />
                <circle cx="140" cy="42" r="4.5" fill="#a78bfa" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="222" cy="115" r="4.5" fill="#a78bfa" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="140" cy="178" r="4.5" fill="#a78bfa" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="60" cy="115" r="4.5" fill="#a78bfa" stroke="#090b10" strokeWidth="1.8" />
              </g>

              {/* Polygon Team B (Teal) */}
              <g
                style={{
                  transformOrigin: '140px 115px',
                  transform: step >= 4 ? 'scale(1)' : 'scale(0)',
                  opacity: step >= 4 ? 1 : 0,
                  transition:
                    'transform 1.55s cubic-bezier(0.22, 1.12, 0.36, 1), opacity 0.7s ease',
                }}
              >
                <polygon
                  points="140,68 184,115 140,192 92,115"
                  fill="rgba(45,212,191,0.30)"
                  stroke="#2dd4bf"
                  strokeWidth="3"
                  className="neon-pulse"
                  style={{ color: '#2dd4bf', animationDelay: '0.8s' }}
                />
                <circle cx="140" cy="68" r="4.5" fill="#2dd4bf" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="184" cy="115" r="4.5" fill="#2dd4bf" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="140" cy="192" r="4.5" fill="#2dd4bf" stroke="#090b10" strokeWidth="1.8" />
                <circle cx="92" cy="115" r="4.5" fill="#2dd4bf" stroke="#090b10" strokeWidth="1.8" />
              </g>

              {/* Axes Labels */}
              <text
                x="140"
                y="18"
                textAnchor="middle"
                fill="#fff"
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
                fill="#fff"
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
                fill="#fff"
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
                fill="#fff"
                fontSize="10"
                fontWeight="700"
                className="font-hud"
                style={{ opacity: axesVisible[3] ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                GLOO
              </text>
            </svg>
          </div>

          {/* Right: Semi-Circle Clash Gauge & Stat Triplet */}
          <div className="hud-card rounded-2xl p-5 flex flex-col items-center">
            <div className="relative w-full max-w-[270px]">
              <svg viewBox="0 0 320 175" className="w-full overflow-visible">
                <path
                  d="M 45 155 A 115 115 0 0 1 275 155"
                  fill="none"
                  stroke="rgba(168,85,247,0.16)"
                  strokeWidth="30"
                />
                <path
                  className="arc-sweep neon-pulse"
                  style={{ color: '#8b5cf6' }}
                  d="M 45 155 A 115 115 0 0 1 275 155"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="24"
                  strokeDasharray={ARC}
                  strokeDashoffset={step >= 3 ? ARC * (1 - pctA / 100) : ARC}
                />
                <path
                  className="arc-sweep neon-pulse"
                  style={{ color: '#2dd4bf', animationDelay: '0.6s' }}
                  d="M 275 155 A 115 115 0 0 0 45 155"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="24"
                  strokeDasharray={ARC}
                  strokeDashoffset={step >= 4 ? ARC * (1 - pctB / 100) : ARC}
                />
                <path
                  d="M 45 155 A 115 115 0 0 1 275 155"
                  fill="none"
                  stroke="#c084fc"
                  strokeOpacity="0.88"
                  strokeWidth="4.5"
                  className="wire-flow"
                />
              </svg>
              <div className="absolute inset-x-0 bottom-2 text-center font-hud text-2xl font-bold text-white">
                <span className="text-violet-400">{dispP1}%</span> :{' '}
                <span className="text-teal-300">{dispP2}%</span>
              </div>
            </div>

            {/* Bottom 3 Comparative Stats */}
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
