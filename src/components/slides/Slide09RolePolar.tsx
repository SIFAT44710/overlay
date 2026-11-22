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
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide09RolePolar({ sheetData, theme, onElementClick }: SlideProps) {
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

  const ps = polarSets[source] || polarSets.role_avg;
  const roleCols = [themeS8.rusher, themeS8.support, themeS8.sniper, themeS8.bomber];

  useEffect(() => {
    const cvs1 = canvas1Ref.current;
    const cvs2 = canvas2Ref.current;
    if (!cvs1 || !cvs2) return;

    if (chart1Ref.current) chart1Ref.current.destroy();
    if (chart2Ref.current) chart2Ref.current.destroy();

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
            if (!elems.length || !onElementClick) return;
            const idx = elems[0].index;
            const keys = ['rusher', 'support', 'sniper', 'bomber'];
            onElementClick(evt.native, 's8', keys[idx] || 'rusher', `${ps.lbls[idx]} Role Color`);
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(9, 11, 18, 0.95)',
              titleColor: '#F5B700',
              bodyColor: '#ffffff',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (item: any) => `Value: ${formatNumber(item.raw)}`,
              },
            },
          },
          scales: {
            r: {
              grid: { color: 'rgba(226,232,240,0.22)' },
              ticks: { display: false },
            },
          },
        },
      });

    chart1Ref.current = mk(cvs1, ps.dA);
    chart2Ref.current = mk(cvs2, ps.dB);

    return () => {
      chart1Ref.current?.destroy();
      chart2Ref.current?.destroy();
    };
  }, [ps, roleCols, onElementClick]);

  return (
    <div className="w-full max-w-[1340px] grid grid-cols-1 md:grid-cols-2 gap-6 font-hud">
      {/* Left Polar Chart */}
      <div className="flex flex-col items-center">
        <div className="mb-2 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-purple-400 font-hud text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5 relative shadow-xl top1-hero-glow">
          <SpiritFireCanvas />
          <span style={{ color: ps.badgeColA }}>{ps.titleA}</span>
          <span>{ps.leadA}</span>
        </div>
        <div className="relative h-[380px] sm:h-[440px] w-full">
          <canvas ref={canvas1Ref} />
        </div>
      </div>

      {/* Right Polar Chart */}
      <div className="flex flex-col items-center">
        <div className="mb-2 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-purple-400 font-hud text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5 relative shadow-xl top1-hero-glow">
          <SpiritFireCanvas />
          <span style={{ color: ps.badgeColB }}>{ps.titleB}</span>
          <span>{ps.leadB}</span>
        </div>
        <div className="relative h-[380px] sm:h-[440px] w-full">
          <canvas ref={canvas2Ref} />
        </div>
      </div>
    </div>
  );
}
