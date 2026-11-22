'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

Chart.register(...registerables);

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide09RolePolar({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);

  const s8 = (theme?.s8 as any) || {};

  // Independent color arrays for Left Circle (Card A) and Right Circle (Card B)
  const roleColsA = [
    s8.a_rusher || s8.rusher || '#EF4444',
    s8.a_support || s8.support || '#22C55E',
    s8.a_sniper || s8.sniper || '#A855F7',
    s8.a_bomber || s8.bomber || '#FACC15',
  ];

  const roleColsB = [
    s8.b_rusher || s8.rusher || '#38BDF8',
    s8.b_support || s8.support || '#2DD4BF',
    s8.b_sniper || s8.sniper || '#F5B700',
    s8.b_bomber || s8.bomber || '#E11D48',
  ];

  const source = theme?.sources?.[8] || 'role_avg';

  const polarSets: Record<
    string,
    {
      lbls: string[];
      dA: number[];
      dB: number[];
      titleA: string;
      leadA: string;
      titleB: string;
      leadB: string;
      badgeColA: string;
      badgeColB: string;
    }
  > = {
    role_avg: {
      lbls: ['Rusher', 'Support', 'Sniper', 'Bomber'],
      dA: [10.3, 10.3, 10.4, 11.7],
      dB: [6037, 6207, 9175, 6545],
      titleA: '#1 AVG KILLS',
      leadA: 'BOMBER • 11.7',
      titleB: '#1 AVG DAMAGE',
      leadB: 'SNIPER • 9,175',
      badgeColA: '#FACC15',
      badgeColB: '#A855F7',
    },
    role_total: {
      lbls: ['Rusher', 'Support', 'Sniper', 'Bomber'],
      dA: [269, 134, 83, 70],
      dB: [156973, 80695, 73400, 39268],
      titleA: '#1 TOTAL KILLS',
      leadA: 'RUSHER • 269',
      titleB: '#1 TOTAL DAMAGE',
      leadB: 'RUSHER • 156,973',
      badgeColA: '#EF4444',
      badgeColB: '#EF4444',
    },
    role_hs_ast: {
      lbls: ['Rusher', 'Support', 'Sniper', 'Bomber'],
      dA: [284, 142, 74, 82],
      dB: [196, 168, 84, 61],
      titleA: '#1 HEADSHOTS',
      leadA: 'RUSHER • 284',
      titleB: '#1 ASSISTS',
      leadB: 'RUSHER • 196',
      badgeColA: '#EF4444',
      badgeColB: '#22C55E',
    },
    role_acc_mv: {
      lbls: ['Rusher', 'Support', 'Sniper', 'Bomber'],
      dA: [36.4, 31.8, 39.2, 34.5],
      dB: [11840, 12950, 10620, 11410],
      titleA: '#1 ON-TARGET %',
      leadA: 'SNIPER • 39.2%',
      titleB: '#1 MOVED (M)',
      leadB: 'SUPPORT • 12,950',
      badgeColA: '#A855F7',
      badgeColB: '#22C55E',
    },
    top4_teams: {
      lbls: ['TOP', 'EXE', 'S9x', 'CME'],
      dA: [94, 76, 62, 58],
      dB: [40, 22, 34, 35],
      titleA: '#1 TOP 4 KILLS',
      leadA: 'TOP • 94',
      titleB: '#1 PLACE PTS',
      leadB: 'TOP • 40',
      badgeColA: '#F5B700',
      badgeColB: '#F5B700',
    },
  };

  // Bind live Google Sheet data if available
  if (source === 'role_avg' && sheetData?.rolesPolar && sheetData.rolesPolar.length === 4) {
    polarSets.role_avg.dA = sheetData.rolesPolar.map((r) => r.kills);
    polarSets.role_avg.dB = sheetData.rolesPolar.map((r) => r.damage);
  } else if (source === 'role_total' && Array.isArray(sheetData?.roles) && sheetData.roles.length >= 4) {
    const rusher = sheetData.roles.find((r) => r.role?.toUpperCase() === 'RUSHER');
    const support = sheetData.roles.find((r) => r.role?.toUpperCase() === 'SUPPORT');
    const sniper = sheetData.roles.find((r) => r.role?.toUpperCase() === 'SNIPER');
    const bomber = sheetData.roles.find((r) => r.role?.toUpperCase() === 'BOMBER');
    if (rusher && support && sniper && bomber) {
      polarSets.role_total.dA = [rusher.kills, support.kills, sniper.kills, bomber.kills];
      polarSets.role_total.dB = [rusher.damage, support.damage, sniper.damage, bomber.damage];
    }
  } else if (source === 'top4_teams' && sheetData?.standing12 && sheetData.standing12.length >= 4) {
    const t4 = sheetData.standing12.slice(0, 4);
    polarSets.top4_teams.lbls = t4.map((t) => t.tag);
    polarSets.top4_teams.dA = t4.map((t) => t.elims);
    polarSets.top4_teams.dB = t4.map((t) => t.place);
    polarSets.top4_teams.leadA = `${t4[0].tag} • ${t4[0].elims}`;
    polarSets.top4_teams.leadB = `${t4[0].tag} • ${t4[0].place}`;
  }

  const ps = polarSets[source] || polarSets.role_avg;

  const latestRef = useRef({ ps, roleColsA, roleColsB });
  useEffect(() => {
    latestRef.current = { ps, roleColsA, roleColsB };
  });

  // 1. Initial Mount & ReplayKey: Create Both Polar Charts ONCE
  useEffect(() => {
    setAnimated(false);
    const animTimer = setTimeout(() => setAnimated(true), 150);

    const c1 = canvas1Ref.current;
    const c2 = canvas2Ref.current;
    if (!c1 || !c2) return;

    // Clean up any stale charts
    const ex1 = Chart.getChart(c1);
    if (ex1) ex1.destroy();
    const ex2 = Chart.getChart(c2);
    if (ex2) ex2.destroy();
    if (chart1Ref.current) {
      chart1Ref.current.destroy();
      chart1Ref.current = null;
    }
    if (chart2Ref.current) {
      chart2Ref.current.destroy();
      chart2Ref.current = null;
    }

    const { ps: currentPs, roleColsA: currentColsA, roleColsB: currentColsB } = latestRef.current;

    // Pure White Value Plugin for Polar Area Charts with High-Contrast Dark Outline
    const polarValuePlugin = {
      id: 'polarValuePlugin',
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = '800 24px "GFF Latin", "Teko", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        chart.data.datasets.forEach((ds: any, dsIdx: number) => {
          const meta = chart.getDatasetMeta(dsIdx);
          if (meta.hidden) return;
          meta.data.forEach((el: any, i: number) => {
            const raw = ds.data[i];
            if (raw === 0 || raw == null) return;
            const pos = el.tooltipPosition();
            const fullTxt = formatNumber(raw);
            ctx.fillStyle = '#ffffff'; // Always crisp pure white text
            ctx.strokeStyle = 'rgba(9,11,18,0.96)';
            ctx.lineWidth = 4.5;
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 6;
            ctx.strokeText(fullTxt, pos.x, pos.y);
            ctx.fillText(fullTxt, pos.x, pos.y);
            ctx.shadowBlur = 0;
          });
        });
        ctx.restore();
      },
    };

    const mk = (canvas: HTMLCanvasElement, data: number[], cols: string[], side: 'a' | 'b') =>
      new Chart(canvas, {
        type: 'polarArea',
        data: {
          labels: currentPs.lbls,
          datasets: [
            {
              data,
              backgroundColor: cols.map((c) => `${c}D9`),
              borderColor: 'rgba(255,255,255,0.25)',
              borderWidth: 2,
            },
          ],
        },
        plugins: [polarValuePlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { animateRotate: true, animateScale: true, duration: 1550 },
          onClick: (evt: any, elems: any[]) => {
            if (!onElementClick) return;
            let idx = -1;
            if (elems.length > 0) {
              idx = elems[0].index;
            } else {
              const activeChart = side === 'a' ? chart1Ref.current : chart2Ref.current;
              if (activeChart) {
                const near = activeChart.getElementsAtEventForMode(
                  evt.nativeEvent,
                  'nearest',
                  { intersect: false },
                  false
                );
                if (near.length > 0) idx = near[0].index;
              }
            }
            if (idx >= 0) {
              const roleKeys = ['rusher', 'support', 'sniper', 'bomber'];
              const baseKey = roleKeys[idx % 4];
              const key = `${side}_${baseKey}`;
              const sideLabel = side === 'a' ? 'Left Circle' : 'Right Circle';
              onElementClick(
                evt.nativeEvent,
                's8',
                key,
                `${sideLabel}: ${latestRef.current.ps.lbls[idx]} Role`
              );
            }
          },
          scales: {
            r: {
              grid: { color: 'rgba(148,163,184,0.18)' },
              angleLines: { color: 'rgba(148,163,184,0.25)' },
              ticks: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item: any) => `${item.label}: ${formatNumber(item.raw)}`,
              },
            },
          },
        },
      });

    chart1Ref.current = mk(c1, currentPs.dA, currentColsA, 'a');
    chart2Ref.current = mk(c2, currentPs.dB, currentColsB, 'b');

    return () => {
      clearTimeout(animTimer);
      chart1Ref.current?.destroy();
      chart2Ref.current?.destroy();
      chart1Ref.current = null;
      chart2Ref.current = null;
    };
  }, [replayKey]);

  // 2. Data & Theme Background Update: Update in-place silently WITHOUT rebuilding or re-animating
  useEffect(() => {
    if (chart1Ref.current) {
      chart1Ref.current.data.labels = ps.lbls;
      if (chart1Ref.current.data.datasets[0]) {
        chart1Ref.current.data.datasets[0].data = ps.dA;
        chart1Ref.current.data.datasets[0].backgroundColor = roleColsA.map((c) => `${c}D9`);
        const meta = chart1Ref.current.getDatasetMeta(0);
        if (meta) {
          meta.data.forEach((el: any, i: number) => {
            if (el.options) el.options.backgroundColor = `${roleColsA[i % roleColsA.length]}D9`;
          });
        }
      }
      chart1Ref.current.update();
    }
    if (chart2Ref.current) {
      chart2Ref.current.data.labels = ps.lbls;
      if (chart2Ref.current.data.datasets[0]) {
        chart2Ref.current.data.datasets[0].data = ps.dB;
        chart2Ref.current.data.datasets[0].backgroundColor = roleColsB.map((c) => `${c}D9`);
        const meta = chart2Ref.current.getDatasetMeta(0);
        if (meta) {
          meta.data.forEach((el: any, i: number) => {
            if (el.options) el.options.backgroundColor = `${roleColsB[i % roleColsB.length]}D9`;
          });
        }
      }
      chart2Ref.current.update();
    }
  }, [ps.lbls.join(','), ps.dA.join(','), ps.dB.join(','), roleColsA.join(','), roleColsB.join(',')]);

  return (
    <div className="w-full max-w-[1340px] pt-14 flex flex-col gap-5 relative font-hud select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Polar Card A (Left Circle) */}
        <div
          className={`dark-box rounded-2xl p-5 relative border border-white/10 shadow-2xl flex flex-col items-center transition-all duration-700 ${
            animated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3">
            <div className="relative px-2.5 py-1 rounded-lg bg-slate-950/90 border border-purple-400 font-hud text-xs sm:text-sm font-bold text-white flex items-center gap-2 top1-hero-glow">
              <SpiritFireCanvas />
              <span className="text-amber-400 font-extrabold">{ps.titleA}</span>
              <span className="font-extrabold">{ps.leadA}</span>
            </div>
            <div
              className="px-2 py-0.5 rounded-md font-hud text-xs sm:text-sm font-extrabold text-black"
              style={{ backgroundColor: ps.badgeColA }}
            >
              #1 LEADER
            </div>
          </div>

          {/* Left Circle Role Color Selectors */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap w-full mb-2">
            {[
              { key: 'a_rusher', label: 'RUSHER', col: roleColsA[0] },
              { key: 'a_support', label: 'SUPPORT', col: roleColsA[1] },
              { key: 'a_sniper', label: 'SNIPER', col: roleColsA[2] },
              { key: 'a_bomber', label: 'BOMBER', col: roleColsA[3] },
            ].map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={(e) =>
                  onElementClick?.(e, 's8', role.key, `Left Circle: ${role.label} Color`)
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/90 border border-white/15 hover:border-purple-400 font-hud text-xs font-bold cursor-pointer transition-all"
                title={`Click to change Left Circle ${role.label} color`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.col }} />
                <span style={{ color: role.col }}>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="relative h-[380px] sm:h-[440px] w-full">
            <canvas ref={canvas1Ref} className="cursor-pointer" />
          </div>
        </div>

        {/* Polar Card B (Right Circle) */}
        <div
          className={`dark-box rounded-2xl p-5 relative border border-white/10 shadow-2xl flex flex-col items-center transition-all duration-700 ${
            animated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
          style={{ transitionDelay: '0.12s' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3">
            <div className="relative px-2.5 py-1 rounded-lg bg-slate-950/90 border border-purple-400 font-hud text-xs sm:text-sm font-bold text-white flex items-center gap-2 top1-hero-glow">
              <SpiritFireCanvas />
              <span className="text-amber-400 font-extrabold">{ps.titleB}</span>
              <span className="font-extrabold">{ps.leadB}</span>
            </div>
            <div
              className="px-2 py-0.5 rounded-md font-hud text-xs sm:text-sm font-extrabold text-black"
              style={{ backgroundColor: ps.badgeColB }}
            >
              #1 LEADER
            </div>
          </div>

          {/* Right Circle Role Color Selectors */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap w-full mb-2">
            {[
              { key: 'b_rusher', label: 'RUSHER', col: roleColsB[0] },
              { key: 'b_support', label: 'SUPPORT', col: roleColsB[1] },
              { key: 'b_sniper', label: 'SNIPER', col: roleColsB[2] },
              { key: 'b_bomber', label: 'BOMBER', col: roleColsB[3] },
            ].map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={(e) =>
                  onElementClick?.(e, 's8', role.key, `Right Circle: ${role.label} Color`)
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/90 border border-white/15 hover:border-purple-400 font-hud text-xs font-bold cursor-pointer transition-all"
                title={`Click to change Right Circle ${role.label} color`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.col }} />
                <span style={{ color: role.col }}>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="relative h-[380px] sm:h-[440px] w-full">
            <canvas ref={canvas2Ref} className="cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
