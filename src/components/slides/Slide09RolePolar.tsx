'use client';

import React, { useEffect, useRef } from 'react';
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
  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);

  const themeS8 = theme?.s8 || {
    rusher: '#EF4444',
    support: '#22C55E',
    sniper: '#A855F7',
    bomber: '#FACC15',
  };
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
      dA: [269, 134, 83, 19],
      dB: [156973, 80695, 73400, 12240],
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
      dA: [134, 98, 96, 93],
      dB: [57261, 42349, 39120, 48750],
      titleA: '#1 TEAM PTS',
      leadA: 'TOP • 134',
      titleB: '#1 TEAM DMG',
      leadB: 'TOP • 57,261',
      badgeColA: '#F5B700',
      badgeColB: '#F5B700',
    },
  };

  // If live data has rolesPolar, use it
  if (source === 'role_avg' && sheetData?.rolesPolar && sheetData.rolesPolar.length === 4) {
    polarSets.role_avg.dA = sheetData.rolesPolar.map((r) => r.kills);
    polarSets.role_avg.dB = sheetData.rolesPolar.map((r) => r.damage);
  }

  const ps = polarSets[source] || polarSets.role_avg;
  const roleCols = [themeS8.rusher, themeS8.support, themeS8.sniper, themeS8.bomber];

  // Destroy on replayKey change
  useEffect(() => {
    if (chart1Ref.current) {
      chart1Ref.current.destroy();
      chart1Ref.current = null;
    }
    if (chart2Ref.current) {
      chart2Ref.current.destroy();
      chart2Ref.current = null;
    }
  }, [replayKey]);

  useEffect(() => {
    const c1 = canvas1Ref.current;
    const c2 = canvas2Ref.current;
    if (!c1 || !c2) return;

    // Smooth in-place update if both charts exist
    if (chart1Ref.current && chart2Ref.current) {
      chart1Ref.current.data.labels = ps.lbls;
      if (chart1Ref.current.data.datasets[0]) {
        chart1Ref.current.data.datasets[0].data = ps.dA;
        chart1Ref.current.data.datasets[0].backgroundColor = roleCols.map((c) => `${c}D9`);
      }
      chart1Ref.current.update('none');

      chart2Ref.current.data.labels = ps.lbls;
      if (chart2Ref.current.data.datasets[0]) {
        chart2Ref.current.data.datasets[0].data = ps.dB;
        chart2Ref.current.data.datasets[0].backgroundColor = roleCols.map((c) => `${c}D9`);
      }
      chart2Ref.current.update('none');
      return;
    }

    // Value Plugin for Polar Area Charts
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
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = 'rgba(15,23,42,0.94)';
            ctx.lineWidth = 4.5;
            ctx.strokeText(fullTxt, pos.x, pos.y);
            ctx.fillText(fullTxt, pos.x, pos.y);
          });
        });
        ctx.restore();
      },
    };

    const mk = (canvas: HTMLCanvasElement, data: number[]) =>
      new Chart(canvas, {
        type: 'polarArea',
        data: {
          labels: ps.lbls,
          datasets: [
            {
              data,
              backgroundColor: roleCols.map((c) => `${c}D9`),
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
            if (elems.length > 0) {
              const idx = elems[0].index;
              const roleKeys = ['rusher', 'support', 'sniper', 'bomber'];
              const key = roleKeys[idx % 4];
              onElementClick?.(
                evt.nativeEvent,
                's8',
                key,
                `${ps.lbls[idx]} Role Color`
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
            legend: {
              position: 'bottom',
              labels: {
                color: '#ffffff',
                font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              },
            },
            tooltip: {
              callbacks: {
                label: (item: any) => `${item.label}: ${formatNumber(item.raw)}`,
              },
            },
          },
        },
      });

    chart1Ref.current = mk(c1, ps.dA);
    chart2Ref.current = mk(c2, ps.dB);

    return () => {
      chart1Ref.current?.destroy();
      chart2Ref.current?.destroy();
      chart1Ref.current = null;
      chart2Ref.current = null;
    };
  }, [ps, roleCols]);

  return (
    <div className="w-full max-w-[1340px] pt-14 grid grid-cols-1 md:grid-cols-2 gap-6 relative font-hud select-none">
      {/* Polar Card A */}
      <div className="dark-box rounded-2xl p-6 relative">
        <div className="flex justify-between items-center mb-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-hud text-lg font-bold text-slate-300">
            {ps.titleA}
          </div>
          <div
            className="px-3 py-1 rounded-lg font-hud text-xl font-extrabold text-black"
            style={{ backgroundColor: ps.badgeColA }}
          >
            {ps.leadA}
          </div>
        </div>
        <div className="w-full h-[420px] relative">
          <canvas ref={canvas1Ref} />
        </div>
      </div>

      {/* Polar Card B */}
      <div className="dark-box rounded-2xl p-6 relative">
        <div className="flex justify-between items-center mb-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-hud text-lg font-bold text-slate-300">
            {ps.titleB}
          </div>
          <div
            className="px-3 py-1 rounded-lg font-hud text-xl font-extrabold text-black"
            style={{ backgroundColor: ps.badgeColB }}
          >
            {ps.leadB}
          </div>
        </div>
        <div className="w-full h-[420px] relative">
          <canvas ref={canvas2Ref} />
        </div>
      </div>
    </div>
  );
}
