'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MapTeam {
  rank: number;
  tag: string;
  name: string;
  surv: number;
  kill: number;
  total: number;
  booyah: number;
  logoUrl?: string | null;
}

const DEFAULT_MAP_STANDINGS: MapTeam[] = [
  { rank: 1, tag: 'NK',  name: 'NOVA KNIGHT',    surv: 8,  kill: 23, total: 31, booyah: 0 },
  { rank: 2, tag: 'TOP', name: 'RAAD VAI YT',    surv: 9,  kill: 21, total: 30, booyah: 0 },
  { rank: 3, tag: 'EXE', name: 'EXTREME EX',     surv: 5,  kill: 20, total: 25, booyah: 0 },
  { rank: 4, tag: 'CME', name: 'COFFIN MAKERS',  surv: 7,  kill: 17, total: 24, booyah: 0 },
  { rank: 5, tag: 'TRX', name: 'TITANOVA REX',   surv: 12, kill: 6,  total: 18, booyah: 1 },
  { rank: 6, tag: '69',  name: '69 ESPORTS',     surv: 4,  kill: 12, total: 16, booyah: 0 },
  { rank: 7, tag: 'ITZ', name: 'ITZ KABBO',      surv: 3,  kill: 9,  total: 12, booyah: 0 },
  { rank: 8, tag: 'JG',  name: 'JUMA GAMING',    surv: 6,  kill: 3,  total: 9,  booyah: 0 },
  { rank: 9, tag: 'S9x', name: 'SNEAKY9X',       surv: 1,  kill: 2,  total: 3,  booyah: 0 },
  { rank: 10, tag: 'UEO', name: 'TEAM UNIONIZED', surv: 2, kill: 1,  total: 3,  booyah: 0 },
];

export default function Dashboard6({ overrideColors }: { overrideColors?: any } = {}) {
  const [rowsActive, setRowsActive] = useState<boolean[]>(new Array(10).fill(false));
  const [topFireActive, setTopFireActive] = useState(false);

  const { data: sheetData } = useSWR('/api/sheet', fetcher, { refreshInterval: 2000 });

  const list: MapTeam[] = React.useMemo(() => {
    if (sheetData?.data && sheetData.data.length >= 6) {
      return sheetData.data.slice(0, 10).map((r: any, idx: number): MapTeam => {
        const rawName = (r.TeamName || '').trim();
        const tag = (r.Code || rawName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 3)).toUpperCase();
        const kill = parseInt(r.Kill, 10) || 0;
        const surv = parseInt(r['Survival Score'] || r.SurvivalScore || r.Place, 10) || 0;
        const total = parseInt(r.Total || r.TotalPoints, 10) || (kill + surv);
        const booyah = parseInt(r.Booyah, 10) || 0;
        return {
          rank: idx + 1,
          tag,
          name: tag || rawName,
          surv,
          kill,
          total,
          booyah,
          logoUrl: r.LogoUrl || null,
        };
      });
    }
    return DEFAULT_MAP_STANDINGS;
  }, [sheetData]);

  const maxT = 32;

  useEffect(() => {
    setRowsActive(new Array(list.length).fill(false));
    setTopFireActive(false);

    list.forEach((_, i) => {
      const delay = 120 + i * 95;
      setTimeout(() => {
        setRowsActive((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        if (i === 0) {
          setTopFireActive(true);
        }
      }, delay);
    });
  }, [list]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl space-y-2">
        {list.map((t, i) => {
          const isTop1 = i === 0;
          const isLoaded = rowsActive[i];
          const survWidth = Math.min(100, (t.surv / maxT) * 100);
          const killWidth = Math.min(100, (t.kill / maxT) * 100);

          return (
            <div
              key={t.rank}
              className={`pop-card hud-card rounded-xl ${
                isTop1 ? 'px-4 py-3 my-1 top1-hero-glow border-2 border-amber-400/80' : 'px-3.5 py-2'
              } flex items-center gap-3 relative transition-all duration-500`}
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded
                  ? isTop1
                    ? 'translateX(0) scale(1.03)'
                    : 'translateX(0)'
                  : 'translateX(-30px)',
                isolation: 'isolate',
              }}
            >
              {/* Real-time Spirit Fire Canvas on Rank 1 */}
              {isTop1 && (
                <div
                  className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 transition-opacity duration-500 ${
                    topFireActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ zIndex: -1 }}
                >
                  <RealFireCanvas opts={{ light: true }} />
                </div>
              )}

              {/* Rank */}
              <span
                className={`relative z-10 font-hud ${
                  isTop1 ? 'text-base text-amber-400' : 'text-sm text-slate-400'
                } font-extrabold w-6 text-center`}
              >
                #{t.rank}
              </span>

              {/* Logo (if available) + Team Name */}
              <div className="relative z-10 w-36 sm:w-44 truncate flex items-center gap-2">
                {t.logoUrl && (
                  <img
                    src={t.logoUrl}
                    alt={t.tag}
                    className="w-5 h-5 object-contain rounded-full bg-slate-900/60 p-0.5 border border-white/10 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span
                  className={`font-hud ${
                    isTop1 ? 'text-base text-amber-200' : 'text-sm text-white'
                  } font-bold truncate`}
                >
                  {t.name}
                </span>
                {t.booyah > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-extrabold shrink-0 shadow">
                    BOOYAH
                  </span>
                )}
              </div>

              {/* Dual Bar: Survival (Teal) + Kill (Violet) */}
              <div
                className={`relative z-10 flex-1 ${
                  isTop1 ? 'h-6' : 'h-5'
                } bg-purple-950/25 rounded-md overflow-hidden flex`}
              >
                <div
                  className="bar-grow-x bar-live h-full bg-teal-500"
                  style={{
                    ['--bar-glow' as any]: '#5eead4',
                    width: isLoaded ? `${survWidth}%` : '0%',
                    boxShadow: '0 0 8px rgba(45,212,191,0.55)',
                    transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                <div
                  className="bar-grow-x bar-live h-full bg-violet-600"
                  style={{
                    ['--bar-glow' as any]: '#c084fc',
                    width: isLoaded ? `${killWidth}%` : '0%',
                    boxShadow: '0 0 8px rgba(139,92,246,0.55)',
                    transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </div>

              {/* Total Points */}
              <div className="relative z-10 w-32 text-right font-hud text-xs font-bold">
                <span className={isTop1 ? 'text-amber-300 text-base' : 'text-white text-sm'}>
                  {t.total} PTS
                </span>
                <span className="text-slate-400 ml-1">({t.kill}K)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
