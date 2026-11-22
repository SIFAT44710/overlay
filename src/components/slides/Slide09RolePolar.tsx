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
  const roleCols = [themeS8.rusher, themeS8.support, themeS8.sniper, themeS8.bomber];

  const latestRef = useRef({ ps, roleCols });
  useEffect(() => {
    latestRef.current = { ps, roleCols };
  });

  // 1. Initial Mount & ReplayKey: Create Both Polar Charts ONCE
  useEffect(() => {
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

    const { ps: currentPs, roleCols: currentCols } = latestRef.current;

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
          labels: currentPs.lbls,
          datasets: [
            {
              data,
              backgroundColor: currentCols.map((c) => `${c}D9`),
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
                `${latestRef.current.ps.lbls[idx]} Role Color`
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

    chart1Ref.current = mk(c1, currentPs.dA);
    chart2Ref.current = mk(c2, currentPs.dB);

    return () => {
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
        chart1Ref.current.data.datasets[0].backgroundColor = roleCols.map((c) => `${c}D9`);
      }
      chart1Ref.current.update('none');
    }
    if (chart2Ref.current) {
      chart2Ref.current.data.labels = ps.lbls;
      if (chart2Ref.current.data.datasets[0]) {
        chart2Ref.current.data.datasets[0].data = ps.dB;
        chart2Ref.current.data.datasets[0].backgroundColor = roleCols.map((c) => `${c}D9`);
      }
      chart2Ref.current.update('none');
    }
  }, [ps.lbls.join(','), ps.dA.join(','), ps.dB.join(','), roleCols.join(',')]);

  return (
    <div className="w-full max-w-[1340px] pt-14 grid grid-cols-1 md:grid-cols-2 gap-6 relative font-hud select-none">
      {/* Polar Card A */}
      <div className="dark-box rounded-2xl p-5 relative border border-white/10 shadow-2xl flex flex-col items-center">
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
        <div className="relative h-[380px] sm:h-[440px] w-full">
          <canvas ref={canvas1Ref} />
        </div>
      </div>

      {/* Polar Card B */}
      <div className="dark-box rounded-2xl p-5 relative border border-white/10 shadow-2xl flex flex-col items-center">
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
        <div className="relative h-[380px] sm:h-[440px] w-full">
          <canvas ref={canvas2Ref} />
        </div>
      </div>
    </div>
  );
}
