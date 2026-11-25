'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';

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

    // Custom Plugin: Exact Comma Full Numbers with Vertical Anti-Collision (Above/Below separation)
    const valuePlugin = {
      id: 'valuePluginLine',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = '800 24px "GFF Latin", "Teko", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);
        const ds0 = chart.data.datasets[0];
        const ds1 = chart.data.datasets[1];
        const count = Math.max(meta0?.data?.length || 0, meta1?.data?.length || 0);

        const topLimit = (chartArea?.top ?? 20) + 16;
        const botLimit = (chartArea?.bottom ?? 420) - 16;

        for (let i = 0; i < count; i++) {
          const el0 = meta0?.data?.[i];
          const el1 = meta1?.data?.[i];
          const raw0 = ds0?.data?.[i];
          const raw1 = ds1?.data?.[i];

          const has0 = el0 && !meta0.hidden && raw0 !== 0 && raw0 != null;
          const has1 = el1 && !meta1.hidden && raw1 !== 0 && raw1 != null;

          const p0 = has0 ? el0.tooltipPosition() : null;
          const p1 = has1 ? el1.tooltipPosition() : null;

          let y0 = p0 ? p0.y - 20 : 0;
          let y1 = p1 ? p1.y - 20 : 0;

          if (has0 && has1 && p0 && p1) {
            const txt0 = Number(raw0).toLocaleString();
            const txt1 = Number(raw1).toLocaleString();
            const wMax = Math.max(ctx.measureText(txt0).width, ctx.measureText(txt1).width);
            const hClose = Math.abs(p0.x - p1.x) < wMax + 14;
            const vClose = Math.abs(y0 - y1) < 34;

            if (hClose && vClose) {
              // Put higher point's number cleanly ABOVE and lower point's number cleanly BELOW
              if (p0.y <= p1.y) {
                y0 = Math.max(topLimit, p0.y - 24);
                y1 = Math.min(botLimit, p1.y + 26);
                // If still too close near bottom edge, stack both above with 32px gap
                if (Math.abs(y0 - y1) < 30) {
                  y1 = Math.max(topLimit + 30, p1.y - 14);
                  y0 = Math.max(topLimit, y1 - 30);
                }
              } else {
                y1 = Math.max(topLimit, p1.y - 24);
                y0 = Math.min(botLimit, p0.y + 26);
                if (Math.abs(y0 - y1) < 30) {
                  y0 = Math.max(topLimit + 30, p0.y - 14);
                  y1 = Math.max(topLimit, y0 - 30);
                }
              }
            }
          }

          if (has0 && p0) {
            const txt0 = Number(raw0).toLocaleString();
            ctx.fillStyle = ds0.borderColor;
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 5;
            ctx.shadowColor = ds0.borderColor;
            ctx.shadowBlur = 10;
            ctx.strokeText(txt0, p0.x, Math.max(topLimit, Math.min(botLimit, y0)));
            ctx.fillText(txt0, p0.x, Math.max(topLimit, Math.min(botLimit, y0)));
            ctx.shadowBlur = 0;
          }

          if (has1 && p1) {
            const txt1 = Number(raw1).toLocaleString();
            ctx.fillStyle = ds1.borderColor;
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 5;
            ctx.shadowColor = ds1.borderColor;
            ctx.shadowBlur = 10;
            ctx.strokeText(txt1, p1.x, Math.max(topLimit, Math.min(botLimit, y1)));
            ctx.fillText(txt1, p1.x, Math.max(topLimit, Math.min(botLimit, y1)));
            ctx.shadowBlur = 0;
          }
        }

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
        onClick: (evt: any, elems: any[]) => {
          if (!onElementClick) return;
          if (elems.length > 0) {
            const dsIdx = elems[0].datasetIndex;
            if (dsIdx === 0) {
              onElementClick(evt.nativeEvent, 's7', 'kills', 'Kills Line Color');
            } else {
              onElementClick(evt.nativeEvent, 's7', 'damage', 'Damage Line Color');
            }
          }
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
      {/* Top Left Clickable Legend */}
      <div className="absolute top-1 left-3 sm:left-6 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => onElementClick?.(e, 's7', 'kills', 'Kills Line Color')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/90 border border-white/15 hover:border-amber-400 font-hud text-xs sm:text-sm font-bold cursor-pointer transition-all"
          title="Click to change Kills line color"
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeS7.kills }} />
          <span style={{ color: themeS7.kills }}>KILLS LINE</span>
        </button>
        <button
          type="button"
          onClick={(e) => onElementClick?.(e, 's7', 'damage', 'Damage Line Color')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/90 border border-white/15 hover:border-sky-400 font-hud text-xs sm:text-sm font-bold cursor-pointer transition-all"
          title="Click to change Damage line color"
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeS7.damage }} />
          <span style={{ color: themeS7.damage }}>DAMAGE LINE</span>
        </button>
      </div>

      {/* Top Peak Badge with Smooth Animated Entrance */}
      <div className="absolute top-1 right-3 sm:right-6 z-30">
        <div
          className={`relative px-3 py-1 rounded-lg bg-transparent border border-white/25 font-hud text-sm sm:text-base font-bold text-white flex items-center gap-2.5 transition-all duration-700 ${
            animated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 scale-95'
          }`}
          style={{ borderColor: themeS7.kills }}
        >
          <TeamLogoBadge
            tag={`M${peakIdx + 1}`}
            color={themeS7.kills}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="text-amber-400 font-extrabold text-xs sm:text-sm">#1 PEAK MATCH • M{peakIdx + 1}</span>
          <span
            className="text-amber-300 font-extrabold text-xs sm:text-sm cursor-pointer hover:underline"
            onClick={(e) => onElementClick?.(e, 's7', 'kills', 'Kills Line Color')}
            title="Click to change Kills line color"
          >
            {killsData[peakIdx]} KILLS
          </span>
          <span className="text-slate-500">|</span>
          <span
            className="text-sky-300 font-extrabold text-xs sm:text-sm cursor-pointer hover:underline"
            onClick={(e) => onElementClick?.(e, 's7', 'damage', 'Damage Line Color')}
            title="Click to change Damage line color"
          >
            {Number(dmgData[peakIdx]).toLocaleString()} DMG
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-[460px] sm:h-[540px] w-full">
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            const chart = chartInstanceRef.current;
            if (!chart || !onElementClick) return;
            const elements = chart.getElementsAtEventForMode(
              e.nativeEvent,
              'nearest',
              { intersect: false },
              false
            );
            if (elements.length > 0) {
              const dsIdx = elements[0].datasetIndex;
              if (dsIdx === 0) {
                onElementClick(e, 's7', 'kills', 'Kills Line Color');
              } else {
                onElementClick(e, 's7', 'damage', 'Damage Line Color');
              }
            } else {
              onElementClick(e, 's7', 'kills', 'Kills Line Color');
            }
          }}
        />
      </div>
    </div>
  );
}
