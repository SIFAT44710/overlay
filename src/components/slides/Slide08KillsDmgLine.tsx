'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';
import { formatNumber } from '@/lib/sheetParsers';

Chart.register(...registerables);

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide08KillsDmgLine({ sheetData, theme, onElementClick }: SlideProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const themeS7 = theme?.s7 || { kills: '#F5B700', damage: '#38BDF8' };

  const killsData = sheetData?.matchTotals?.kills?.length === 5
    ? sheetData.matchTotals.kills
    : [114, 102, 97, 129, 114];

  const dmgData = sheetData?.matchTotals?.damage?.length === 5
    ? sheetData.matchTotals.damage
    : [74334, 67724, 60618, 75983, 71677];

  // Find peak match
  let peakIdx = 0;
  let maxKills = 0;
  killsData.forEach((k, idx) => {
    if (k > maxKills) {
      maxKills = k;
      peakIdx = idx;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Custom Plugin: Exact Comma Full Numbers (Zero 'K')
    const valuePlugin = {
      id: 'valuePluginLine',
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
            ctx.fillStyle = ds.borderColor;
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 4.5;
            ctx.strokeText(fullTxt, pos.x, pos.y - 18);
            ctx.fillText(fullTxt, pos.x, pos.y - 18);
          });
        });
        ctx.restore();
      },
    };

    const newChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['M1', 'M2', 'M3', 'M4', 'M5'],
        datasets: [
          {
            label: 'Total Kills',
            data: killsData,
            borderColor: themeS7.kills,
            backgroundColor: `${themeS7.kills}2A`,
            yAxisID: 'y',
            tension: 0.36,
            fill: true,
            borderWidth: 4,
            pointRadius: 7,
            pointBackgroundColor: themeS7.kills,
            pointBorderColor: '#090b10',
          },
          {
            label: 'Total Damage',
            data: dmgData,
            borderColor: themeS7.damage,
            backgroundColor: `${themeS7.damage}2A`,
            yAxisID: 'y1',
            tension: 0.36,
            fill: true,
            borderWidth: 4,
            pointRadius: 7,
            pointBackgroundColor: themeS7.damage,
            pointBorderColor: '#090b10',
          },
        ],
      },
      plugins: [valuePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 44, bottom: 20 } },
        animation: { duration: 1800, easing: 'easeOutCubic' },
        onClick: (evt: any, elems: any[]) => {
          if (!elems.length || !onElementClick) return;
          const dsIdx = elems[0].datasetIndex;
          if (dsIdx === 0) {
            onElementClick(evt.native, 's7', 'kills', 'Total Kills Line');
          } else {
            onElementClick(evt.native, 's7', 'damage', 'Total Damage Line');
          }
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
              label: (item: any) => `${item.dataset.label}: ${formatNumber(item.raw)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#ffffff', font: { size: 20, weight: 'bold' } },
            grid: { color: 'rgba(100,116,139,0.22)' },
          },
          y: {
            position: 'left',
            title: { display: true, text: 'KILLS', color: themeS7.kills, font: { size: 18, weight: 'bold' } },
            ticks: {
              color: '#fde047',
              font: { size: 18, weight: 'bold' },
              callback: (v: any) => formatNumber(v),
            },
            grid: { color: 'rgba(100,116,139,0.32)' },
          },
          y1: {
            position: 'right',
            grid: { display: false },
            title: { display: true, text: 'DAMAGE', color: themeS7.damage, font: { size: 18, weight: 'bold' } },
            ticks: {
              color: '#7dd3fc',
              font: { size: 18, weight: 'bold' },
              callback: (v: any) => formatNumber(v),
            },
          },
        },
      },
    });

    chartInstanceRef.current = newChart;

    return () => {
      newChart.destroy();
    };
  }, [killsData, dmgData, themeS7.kills, themeS7.damage, onElementClick]);

  return (
    <div className="w-full max-w-[1340px] pt-18 relative font-hud">
      {/* Top Right Peak Match Pill with Spirit Flame */}
      <div className="absolute top-1 right-3 sm:right-6 z-30">
        <div className="relative px-4 py-1.5 rounded-xl bg-slate-950/90 border border-purple-400 font-hud text-2xl sm:text-3xl font-bold text-white flex items-center gap-3.5 shadow-2xl top1-hero-glow">
          <SpiritFireCanvas />
          <TeamLogoBadge tag={`M${peakIdx + 1}`} color="#F5B700" sizeCls="w-16 h-16" />
          <span className="text-amber-400">#1 PEAK MATCH • M{peakIdx + 1}</span>
          <span className="text-amber-300">{killsData[peakIdx]} KILLS</span>
          <span className="text-slate-500">|</span>
          <span className="text-sky-300">{formatNumber(dmgData[peakIdx])} DMG</span>
        </div>
      </div>

      <div className="relative h-[420px] sm:h-[500px] w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
