'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { startRealFireCanvas } from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StandingTeam {
  rank: string;
  tag: string;
  name: string;
  booyah: number;
  elims: number;
  place: number;
  total: number;
  col: string;
}

const DEFAULT_STANDING12: StandingTeam[] = [
  { rank: '1ST',  tag: 'TOP', name: 'RAAD VAI YT',       booyah: 1, elims: 94, place: 40, total: 134, col: '#F5B700' },
  { rank: '2ND',  tag: 'EXE', name: 'EXTREME EX',        booyah: 0, elims: 76, place: 22, total: 98,  col: '#6225A6' },
  { rank: '3RD',  tag: 'S9x', name: 'SNEAKY9X',          booyah: 2, elims: 62, place: 34, total: 96,  col: '#00DF82' },
  { rank: '4TH',  tag: 'CME', name: 'COFFIN MAKERS ESP', booyah: 0, elims: 58, place: 35, total: 93,  col: '#EC008C' },
  { rank: '5TH',  tag: 'TRX', name: 'TITANOVA REX',      booyah: 1, elims: 49, place: 36, total: 85,  col: '#38BDF8' },
  { rank: '6TH',  tag: 'UEO', name: 'TEAM UNIONIZED',    booyah: 1, elims: 50, place: 28, total: 78,  col: '#8B5CF6' },
  { rank: '7TH',  tag: 'NK',  name: 'NOVA KNIGHT',       booyah: 0, elims: 46, place: 23, total: 69,  col: '#F97316' },
  { rank: '8TH',  tag: '69',  name: '69 ESPORTS',        booyah: 0, elims: 48, place: 13, total: 61,  col: '#E11D48' },
  { rank: '9TH',  tag: 'JG',  name: 'JUMA GAMING',       booyah: 0, elims: 35, place: 23, total: 58,  col: '#14B8A6' },
  { rank: '10TH', tag: 'ITZ', name: 'ITZ KABBO',         booyah: 0, elims: 22, place: 14, total: 36,  col: '#64748B' },
  { rank: '11TH', tag: 'EGL', name: 'TEAM EAGLE',        booyah: 0, elims: 16, place: 17, total: 33,  col: '#475569' },
  { rank: '12TH', tag: 'SG',  name: 'SADIA GAMING',      booyah: 0, elims: 0,  place: 0,  total: 0,   col: '#334155' },
];

export default function Dashboard1({ overrideColors }: { overrideColors?: any } = {}) {
  const [wipeKey, setWipeKey] = useState(0);
  const [fireActive, setFireActive] = useState(false);
  const fireCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poll sheet data
  const { data: dayData } = useSWR('/api/daystanding', fetcher, {
    refreshInterval: 2000,
  });

  const standing: StandingTeam[] = React.useMemo(() => {
    if (dayData?.standing && dayData.standing.length >= 6) {
      return dayData.standing.slice(0, 12).map((row: any, i: number) => {
        const ranks = ['1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH','9TH','10TH','11TH','12TH'];
        return {
          rank: ranks[i] || `${i + 1}TH`,
          tag: row.tag || DEFAULT_STANDING12[i]?.tag || `T${i+1}`,
          name: row.TeamName || row.name || DEFAULT_STANDING12[i]?.name || 'TEAM',
          booyah: parseInt(row.booyah || row.Booyah || 0, 10),
          elims: parseInt(row.elims || row.Kill || 0, 10),
          place: parseInt(row.place || row.SurvivalScore || 0, 10),
          total: parseInt(row.total || row.Total || 0, 10),
          col: DEFAULT_STANDING12[i]?.col || '#6225A6',
        };
      });
    }
    return DEFAULT_STANDING12;
  }, [dayData]);

  useEffect(() => {
    setWipeKey((prev) => prev + 1);
    setFireActive(false);
    const t = setTimeout(() => {
      setFireActive(true);
      if (fireCanvasRef.current) {
        startRealFireCanvas(fireCanvasRef.current, { light: true });
      }
    }, 780);
    return () => clearTimeout(t);
  }, [dayData?.updatedAt]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none">
      <div key={wipeKey} className="w-full max-w-4xl relative">
        {/* Purple Starburst Stinger Flash */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20 overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-80 h-80 stinger-flash">
            <polygon
              points="150,10 185,110 290,115 205,175 235,280 150,215 65,280 95,175 10,115 115,110"
              fill="#7C3AED"
              fillOpacity="0.7"
            />
          </svg>
        </div>

        {/* Header Tags */}
        <div className="grid grid-cols-[62px_1fr_64px_64px_76px_74px] items-center gap-1 px-1 mb-1.5 font-hud text-[10px] font-extrabold uppercase tracking-wider">
          <span></span>
          <span></span>
          <span className="skew-tag bg-[#F5B700] text-black text-center py-0.5 border border-black shadow">
            <span className="unskew-tag inline-block">BOOYAHS</span>
          </span>
          <span className="skew-tag bg-[#2E0E56] text-white text-center py-0.5 border border-purple-500/40 shadow">
            <span className="unskew-tag inline-block">ELIMS</span>
          </span>
          <span className="skew-tag bg-[#2E0E56] text-white text-center py-0.5 border border-purple-500/40 shadow">
            <span className="unskew-tag inline-block">PLACE PTS</span>
          </span>
          <span className="skew-tag bg-[#6225A6] text-[#F5B700] text-center py-0.5 border border-black shadow">
            <span className="unskew-tag inline-block">TOTAL PTS</span>
          </span>
        </div>

        {/* 12 Standing Rows */}
        <div className="space-y-1">
          {standing.map((t, i) => {
            const isFirst = i === 0;
            return (
              <div
                key={`${t.rank}-${t.tag}`}
                className={`ffws-row grid grid-cols-[62px_1fr_64px_64px_76px_74px] items-center gap-1 rounded-sm shadow-md transition-all duration-500 relative ${
                  isFirst
                    ? `border-2 border-amber-400 my-1 ${fireActive ? 'top1-hero-glow top1-scale' : ''}`
                    : 'overflow-hidden border border-black/60'
                }`}
                style={{
                  animationDelay: `${140 + i * 68}ms`,
                  background: isFirst
                    ? 'linear-gradient(90deg, rgba(88,28,135,0.68) 0%, rgba(147,51,234,0.72) 100%)'
                    : 'linear-gradient(90deg, rgba(59,7,100,0.48) 0%, rgba(98,37,166,0.52) 100%)',
                  isolation: isFirst ? 'isolate' : undefined,
                }}
              >
                {/* Real-time Spirit Fire Canvas for Rank #1 */}
                {isFirst && (
                  <div
                    className="pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500"
                    style={{
                      zIndex: -1,
                      opacity: fireActive ? 1 : 0,
                    }}
                  >
                    <canvas ref={fireCanvasRef} className="w-full h-full block" />
                  </div>
                )}

                {/* Rank */}
                <div
                  className={`${
                    isFirst ? 'h-11 text-base' : 'h-9 text-xs sm:text-sm'
                  } flex items-center justify-center font-hud font-extrabold italic ${
                    isFirst ? 'bg-[#F5B700] text-black' : 'bg-purple-950/35 text-white'
                  } border-r border-white/10`}
                >
                  {t.rank}
                </div>

                {/* Tag & Name */}
                <div className="flex items-center gap-2.5 pl-2 pr-2 truncate">
                  <span
                    className={`${
                      isFirst ? 'w-7 h-7 text-[10.5px]' : 'w-6 h-6 text-[9.5px]'
                    } rounded flex items-center justify-center font-hud font-extrabold border border-black shrink-0`}
                    style={{
                      background: t.col,
                      color:
                        t.col === '#F5B700' || t.col === '#00DF82'
                          ? '#000000'
                          : '#ffffff',
                    }}
                  >
                    {t.tag}
                  </span>
                  <span
                    className={`font-title ${
                      isFirst ? 'text-base sm:text-lg text-amber-200' : 'text-sm sm:text-base text-white'
                    } font-bold truncate`}
                  >
                    {t.name}
                  </span>
                </div>

                {/* Booyahs */}
                <div
                  className={`text-center font-hud ${
                    isFirst ? 'text-base' : 'text-sm'
                  } font-bold text-white`}
                >
                  {t.booyah}
                </div>

                {/* Elims */}
                <div
                  className={`text-center font-hud ${
                    isFirst ? 'text-base' : 'text-sm'
                  } font-bold text-slate-200`}
                >
                  {t.elims}
                </div>

                {/* Place Pts */}
                <div
                  className={`text-center font-hud ${
                    isFirst ? 'text-base' : 'text-sm'
                  } font-bold text-slate-200`}
                >
                  {t.place}
                </div>

                {/* Total Pts */}
                <div
                  className={`${
                    isFirst ? 'h-11 text-base sm:text-lg' : 'h-9 text-sm sm:text-base'
                  } flex items-center justify-center font-hud font-extrabold ${
                    isFirst ? 'bg-[#F5B700] text-black' : 'bg-purple-950/30 text-[#F5B700]'
                  }`}
                >
                  {t.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
