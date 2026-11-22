'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import SpiritFireCanvas from '@/components/SpiritFireCanvas';

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
  const [animated, setAnimated] = useState(false);
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

  const latestRef = useRef({ killsData, dmgData, themeS7 });
  useEffect(() => {
    latestRef.current = { killsData, dmgData, themeS7 };
  });

  // 1. Initial Mount & ReplayKey: Create Chart ONCE
  useEffect(() => {
    setAnimated(false);
    const animTimer = setTimeout(() => setAnimated(true), 150);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up any stale chart on this canvas
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const { killsData: initialKills, dmgData: initialDmg, themeS7: initialTheme } = latestRef.current;

    // Custom Plugin: Exact Comma Full Numbers with Neon Drop-Shadow Glow
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
            ctx.lineWidth = 5;
            ctx.shadowColor = ds.borderColor;
            ctx.shadowBlur = 10;
            ctx.strokeText(fullTxt, pos.x, pos.y - 18);
            ctx.fillText(fullTxt, pos.x, pos.y - 18);
            ctx.shadowBlur = 0;
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
            data: initialKills,
            borderColor: initialTheme.kills,
            backgroundColor: `${initialTheme.kills}2A`,
            yAxisID: 'y',
            tension: 0.36,
            fill: true,
            borderWidth: 4,
            pointRadius: (c: any) => (c.dataIndex === peakIdx ? 9 : 6.5),
            pointHoverRadius: 11,
            pointBackgroundColor: initialTheme.kills,
            pointBorderColor: '#090b10',
            pointBorderWidth: 2.5,
          },
          {
            label: 'Total Damage',
            data: initialDmg,
            borderColor: initialTheme.damage,
            backgroundColor: `${initialTheme.damage}22`,
            yAxisID: 'y1',
            tension: 0.36,
            fill: true,
            borderWidth: 4,
            pointRadius: (c: any) => (c.dataIndex === peakIdx ? 9 : 6.5),
            pointHoverRadius: 11,
            pointBackgroundColor: initialTheme.damage,
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
              color: initialTheme.kills,
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
              color: initialTheme.damage,
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
          legend: { display: false },
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
      clearTimeout(animTimer);
      newChart.destroy();
      if (chartInstanceRef.current === newChart) {
        chartInstanceRef.current = null;
      }
    };
  }, [replayKey]);

  // 2. Data & Theme Background Update: Update in-place silently WITHOUT rebuilding
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].data = killsData;
      chart.data.datasets[0].borderColor = themeS7.kills;
      chart.data.datasets[0].backgroundColor = `${themeS7.kills}2A`;
      (chart.data.datasets[0] as any).pointBackgroundColor = themeS7.kills;
    }
    if (chart.data.datasets[1]) {
      chart.data.datasets[1].data = dmgData;
      chart.data.datasets[1].borderColor = themeS7.damage;
      chart.data.datasets[1].backgroundColor = `${themeS7.damage}22`;
      (chart.data.datasets[1] as any).pointBackgroundColor = themeS7.damage;
    }
    chart.update('none');
  }, [killsData.join(','), dmgData.join(','), themeS7.kills, themeS7.damage]);

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top Peak Badge with Smooth Animated Entrance */}
      <div className="absolute top-1 right-3 sm:right-6 z-30">
        <div
          className={`relative px-3 py-1 rounded-lg bg-slate-950/90 border border-purple-400/80 font-hud text-sm sm:text-base font-bold text-white flex items-center gap-2.5 shadow-xl transition-all duration-700 ${
            animated ? 'top1-hero-glow top1-scale opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 scale-95'
          }`}
          style={{ borderColor: themeS7.kills }}
        >
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={`M${peakIdx + 1}`}
            color={themeS7.kills}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="text-amber-400 font-extrabold text-xs sm:text-sm">#1 PEAK MATCH • M{peakIdx + 1}</span>
          <span className="text-amber-300 font-extrabold text-xs sm:text-sm">{killsData[peakIdx]} KILLS</span>
          <span className="text-slate-500">|</span>
          <span className="text-sky-300 font-extrabold text-xs sm:text-sm">{Number(dmgData[peakIdx]).toLocaleString()} DMG</span>
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
