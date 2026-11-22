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
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

export default function Slide08KillsDmgLine({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const themeS7 = theme?.s7 || { kills: '#F5B700', damage: '#38BDF8' };

  const killsData =
    sheetData?.matchTotals?.kills?.length === 5
      ? sheetData.matchTotals.kills
      : [114, 102, 97, 129, 114];

  const dmgData =
    sheetData?.matchTotals?.damage?.length === 5
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

  // Destroy on replayKey change
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
  }, [replayKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Smooth in-place update if chart already exists
    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].data = killsData;
        chart.data.datasets[0].borderColor = themeS7.kills;
        chart.data.datasets[0].backgroundColor = `${themeS7.kills}2A`;
      }
      if (chart.data.datasets[1]) {
        chart.data.datasets[1].data = dmgData;
        chart.data.datasets[1].borderColor = themeS7.damage;
        chart.data.datasets[1].backgroundColor = `${themeS7.damage}22`;
      }
      chart.update('none');
      return;
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
            const fullTxt = Number(raw).toLocaleString();
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
            pointBorderWidth: 2.5,
          },
          {
            label: 'Total Damage',
            data: dmgData,
            borderColor: themeS7.damage,
            backgroundColor: `${themeS7.damage}22`,
            yAxisID: 'y1',
            tension: 0.36,
            fill: true,
            borderWidth: 4,
            pointRadius: 7,
            pointBackgroundColor: themeS7.damage,
            pointBorderColor: '#090b10',
            pointBorderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1600,
          easing: 'easeOutCubic',
        },
        layout: {
          padding: {
            top: 48,
            bottom: 24,
            left: 20,
            right: 20,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(148,163,184,0.18)' },
            ticks: {
              color: '#ffffff',
              font: { size: 20, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(148,163,184,0.18)' },
            title: {
              display: true,
              text: 'KILLS',
              color: themeS7.kills,
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: '#fde047',
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => Number(v).toLocaleString(),
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'DAMAGE',
              color: themeS7.damage,
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: '#7dd3fc',
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => Number(v).toLocaleString(),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (item: any) => `${item.dataset.label}: ${Number(item.raw).toLocaleString()}`,
            },
          },
        },
      },
      plugins: [valuePlugin],
    });

    chartInstanceRef.current = newChart;

    return () => {
      newChart.destroy();
      chartInstanceRef.current = null;
    };
  }, [killsData, dmgData, themeS7]);

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top Peak Badge */}
      <div className="absolute top-1 right-3 sm:right-6 z-30">
        <div className="relative px-4 py-1.5 rounded-xl bg-slate-950/90 border border-purple-400/70 font-hud text-2xl sm:text-3xl font-bold text-white flex items-center gap-3.5 shadow-2xl top1-hero-glow">
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={`M${peakIdx + 1}`}
            color={themeS7.kills}
            sizeCls="w-16 h-16"
          />
          <span className="text-amber-400 font-extrabold">#1 PEAK MATCH • M{peakIdx + 1}</span>
          <span className="text-amber-300 font-extrabold">{killsData[peakIdx]} KILLS</span>
          <span className="text-slate-500">|</span>
          <span className="text-sky-300 font-extrabold">{Number(dmgData[peakIdx]).toLocaleString()} DMG</span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-[460px] sm:h-[540px] w-full">
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            onElementClick?.(e, 's7', 'kills', 'Line Chart Colors');
          }}
        />
      </div>
    </div>
  );
}
