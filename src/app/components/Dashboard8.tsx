'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import RealFireCanvas from './RealFireCanvas';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface H2HDayTeam {
  name: string;
  total: number;
  kills: number;
  surv: number;
  damage: number;
  hs: number;
  booyah: number;
}

const DEFAULT_H2H_DAY: { a: H2HDayTeam; b: H2HDayTeam } = {
  a: { name: 'SNEAKY9X', total: 96, kills: 62, surv: 34, damage: 41088, hs: 51, booyah: 2 },
  b: { name: 'TEAM UNIONIZED', total: 78, kills: 50, surv: 28, damage: 29641, hs: 41, booyah: 1 },
};

export default function Dashboard8({ overrideColors }: { overrideColors?: any } = {}) {
  const [widthsA, setWidthsA] = useState<number[]>(new Array(6).fill(0));
  const [widthsB, setWidthsB] = useState<number[]>(new Array(6).fill(0));
  const [fireActive, setFireActive] = useState(false);

  const { data: dayData } = useSWR('/api/daystanding', fetcher, { refreshInterval: 2000 });

  const h2h = React.useMemo(() => {
    if (dayData?.standing && dayData.standing.length >= 2) {
      const t1 = dayData.standing[0];
      const t2 = dayData.standing[1];
      const tag1 = t1.tag || t1.name || 'S9x';
      const tag2 = t2.tag || t2.name || 'UEO';
      const tot1 = parseInt(t1.total, 10) || DEFAULT_H2H_DAY.a.total;
      const tot2 = parseInt(t2.total, 10) || DEFAULT_H2H_DAY.b.total;
      const k1 = parseInt(t1.elims, 10) || DEFAULT_H2H_DAY.a.kills;
      const k2 = parseInt(t2.elims, 10) || DEFAULT_H2H_DAY.b.kills;
      return {
        a: {
          name: tag1,
          total: tot1,
          kills: k1,
          surv: parseInt(t1.place, 10) || Math.max(0, tot1 - k1),
          damage: DEFAULT_H2H_DAY.a.damage,
          hs: Math.round(k1 * 0.85) || 51,
          booyah: parseInt(t1.booyah, 10) || 2,
        },
        b: {
          name: tag2,
          total: tot2,
          kills: k2,
          surv: parseInt(t2.place, 10) || Math.max(0, tot2 - k2),
          damage: DEFAULT_H2H_DAY.b.damage,
          hs: Math.round(k2 * 0.85) || 41,
          booyah: parseInt(t2.booyah, 10) || 1,
        },
      };
    }
    return DEFAULT_H2H_DAY;
  }, [dayData]);

  const { a, b } = h2h;
  const winnerSide = a.total >= b.total ? 'a' : 'b';

  const metrics = [
    { label: 'TOTAL PTS', va: a.total, vb: b.total, max: Math.max(110, a.total, b.total) },
    { label: 'KILLS', va: a.kills, vb: b.kills, max: Math.max(75, a.kills, b.kills) },
    { label: 'SURVIVAL PTS', va: a.surv, vb: b.surv, max: Math.max(45, a.surv, b.surv) },
    { label: 'TOTAL DAMAGE', va: a.damage, vb: b.damage, max: Math.max(48000, a.damage, b.damage) },
    { label: 'HEADSHOTS', va: a.hs, vb: b.hs, max: Math.max(65, a.hs, b.hs) },
    { label: 'BOOYAHS', va: a.booyah, vb: b.booyah, max: Math.max(3, a.booyah, b.booyah) },
  ];

  useEffect(() => {
    setWidthsA(new Array(6).fill(0));
    setWidthsB(new Array(6).fill(0));
    setFireActive(false);

    metrics.forEach((m, i) => {
      setTimeout(() => {
        const wA = Math.min(100, (m.va / m.max) * 100);
        const wB = Math.min(100, (m.vb / m.max) * 100);
        setWidthsA((prev) => {
          const next = [...prev];
          next[i] = wA;
          return next;
        });
        setWidthsB((prev) => {
          const next = [...prev];
          next[i] = wB;
          return next;
        });
      }, 160 + i * 160);
    });

    const tFire = setTimeout(() => {
      setFireActive(true);
    }, 320);

    return () => clearTimeout(tFire);
  }, [a.total, b.total]);

  return (
    <div className="broadcast-stage w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-transparent select-none font-sans">
      <div className="w-full max-w-4xl hud-card rounded-2xl p-5 space-y-4">
        {/* Header Bar with Day H2H Badge */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          {/* Team A Header */}
          <div
            className={`font-hud font-bold text-violet-400 px-3 py-1 rounded-xl relative transition-all duration-500 ${
              winnerSide === 'a' && fireActive ? 'text-2xl top1-hero-glow' : 'text-xl'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winnerSide === 'a' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10">{a.name}</span>
          </div>

          <span className="px-3 py-0.5 rounded-full bg-amber-400 text-black text-xs font-extrabold shadow">
            DAY H2H
          </span>

          {/* Team B Header */}
          <div
            className={`font-hud font-bold text-teal-300 px-3 py-1 rounded-xl relative transition-all duration-500 ${
              winnerSide === 'b' && fireActive ? 'text-2xl top1-hero-glow' : 'text-xl'
            }`}
            style={{ isolation: 'isolate' }}
          >
            {winnerSide === 'b' && (
              <div
                className={`pointer-events-none absolute -inset-x-2 -top-6 bottom-0 transition-opacity duration-500 ${
                  fireActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: -1 }}
              >
                <RealFireCanvas opts={{ light: true }} />
              </div>
            )}
            <span className="relative z-10">{b.name}</span>
          </div>
        </div>

        {/* 6 Butterfly Comparison Rows */}
        <div className="space-y-3">
          {metrics.map((m, i) => (
            <div key={m.label} className="grid grid-cols-[1fr_110px_1fr] items-center gap-3">
              {/* Left Half: Team A */}
              <div className="flex items-center justify-end gap-2">
                <span className="font-hud text-sm font-bold text-white">
                  {m.va.toLocaleString()}
                </span>
                <div className="w-full h-5 bg-purple-950/25 rounded-l-md overflow-hidden flex justify-end">
                  <div
                    className="bar-grow-x bar-live h-full bg-violet-600 rounded-l-md"
                    style={{
                      ['--bar-glow' as any]: '#c084fc',
                      width: `${widthsA[i]}%`,
                      boxShadow: '0 0 10px rgba(139,92,246,0.6)',
                      transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </div>
              </div>

              {/* Center Metric Label */}
              <div className="text-center font-hud text-[11px] font-bold text-slate-300 tracking-wider">
                {m.label}
              </div>

              {/* Right Half: Team B */}
              <div className="flex items-center gap-2">
                <div className="w-full h-5 bg-purple-950/25 rounded-r-md overflow-hidden">
                  <div
                    className="bar-grow-x bar-live h-full bg-teal-500 rounded-r-md"
                    style={{
                      ['--bar-glow' as any]: '#5eead4',
                      width: `${widthsB[i]}%`,
                      boxShadow: '0 0 10px rgba(45,212,191,0.6)',
                      transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </div>
                <span className="font-hud text-sm font-bold text-white">
                  {m.vb.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
