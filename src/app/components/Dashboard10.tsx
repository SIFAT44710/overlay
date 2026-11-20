'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MvpData {
  name: string;
  team: string;
  kills: number;
  damage: number;
  assist: number;
  hs: number;
  knocks: number;
  onTarget: number;
  dist?: number;
}

const DEFAULT_MVP: MvpData = {
  name: 'NK.SAAD69',
  team: 'NOVA KNIGHT',
  kills: 14,
  damage: 5446,
  assist: 6,
  hs: 16,
  knocks: 16,
  onTarget: 33.4,
  dist: 3603,
};

export default function Dashboard10({ overrideColors }: { overrideColors?: any } = {}) {
  const [animated, setAnimated] = useState(false);
  const [displayedAcc, setDisplayedAcc] = useState(0);
  const [fireActive, setFireActive] = useState(false);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const mvp = React.useMemo(() => {
    if (sheetData?.data && sheetData.data.length > 0) {
      const top = sheetData.data[0];
      const kills = parseInt(top.Kill, 10) || DEFAULT_MVP.kills;
      const damage = parseInt(top.Damage, 10) || DEFAULT_MVP.damage;
      const tag = (top.Code || (top.TeamName ? top.TeamName.slice(0, 3) : DEFAULT_MVP.team)).toUpperCase();
      return {
        name: top.MvpPlayer || `${tag}.LEADER`,
        team: tag,
        kills,
        damage,
        assist: 6,
        hs: 16,
        knocks: 16,
        onTarget: 33.4,
        dist: 3603,
      };
    }
    return DEFAULT_MVP;
  }, [sheetData]);

  const R = 125;
  const ARC = Math.PI * R;
  const accent = '#fbbf24';

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimated(true);
      setFireActive(true);

      const start = performance.now();
      const duration = 1850;
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedAcc(parseFloat((mvp.onTarget * eased).toFixed(1)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 260);

    return () => clearTimeout(t);
  }, [mvp.onTarget]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full flex justify-center">
        <div
          className={`hud-card rounded-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-md relative transition-all duration-700 ${
            fireActive ? 'top1-hero-glow top1-scale' : ''
          }`}
          style={{ isolation: 'isolate' }}
        >
          {/* Real-time Spirit Fire Canvas on MVP Card */}
          {fireActive && (
            <div
              className="pointer-events-none absolute -inset-x-3 -top-10 bottom-0 transition-opacity duration-500 opacity-100"
              style={{ zIndex: -1 }}
            >
              <RealFireCanvas opts={{ light: true }} />
            </div>
          )}

          {/* Top Badge: MATCH 5 MVP • PLAYER */}
          <span
            className="relative z-10 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-black mb-1 shadow"
            style={{ background: accent }}
          >
            MATCH 5 MVP • {mvp.name}
          </span>

          <div className="relative z-10 font-hud text-xs font-bold uppercase tracking-widest text-slate-300 mt-1 mb-3">
            ON-TARGET ACCURACY GAUGE
          </div>

          {/* Semi-Circle SVG Gauge */}
          <div className="relative z-10 w-full max-w-[310px]">
            <svg viewBox="0 0 360 195" className="w-full overflow-visible">
              {/* Background Track */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="rgba(168,85,247,0.16)"
                strokeWidth="34"
              />

              {/* Progress Arc (Gold) */}
              <path
                className="arc-sweep neon-pulse"
                style={{ color: accent }}
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke={accent}
                strokeWidth="26"
                strokeLinecap="round"
                strokeDasharray={ARC}
                strokeDashoffset={animated ? ARC * (1 - mvp.onTarget / 100) : ARC}
              />

              {/* Wire-Flow Overlay */}
              <path
                d="M 55 170 A 125 125 0 0 1 305 170"
                fill="none"
                stroke="#fde047"
                strokeOpacity="0.92"
                strokeWidth="4.5"
                className="wire-flow"
              />
            </svg>

            {/* Center Accuracy Readout */}
            <div className="absolute inset-x-0 bottom-2 text-center">
              <div className="font-hud text-4xl font-bold text-white">
                {displayedAcc}%
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                SHOTS ON TARGET
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
