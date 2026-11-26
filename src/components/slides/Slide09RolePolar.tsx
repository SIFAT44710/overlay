'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import TeamLogoBadge from '@/components/TeamLogoBadge';
import { formatNumber } from '@/lib/sheetParsers';

Chart.register(...registerables);

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
}

const METRIC_LABELS = ['KILLS', 'DAMAGE', 'HEADSHOTS', 'ASSISTS'];

export default function Slide09RolePolar({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const chart1Ref = useRef<any>(null);
  const chart2Ref = useRef<any>(null);

  const s8 = (theme?.s8 as any) || {};
  const custom = theme?.custom;
  const source = theme?.sources?.[7] || theme?.sources?.[8] || 'sheet_h2h_polar';

  // Independent color arrays for Left Circle (Team A) and Right Circle (Team B)
  const roleColsA = [
    s8.a_kills || s8.a_rusher || s8.rusher || '#EF4444',
    s8.a_damage || s8.a_support || s8.support || '#38BDF8',
    s8.a_hs || s8.a_sniper || s8.sniper || '#A855F7',
    s8.a_assist || s8.a_bomber || s8.bomber || '#22C55E',
  ];

  const roleColsB = [
    s8.b_kills || s8.b_rusher || s8.rusher || '#F5B700',
    s8.b_damage || s8.b_support || s8.support || '#38BDF8',
    s8.b_hs || s8.b_sniper || s8.sniper || '#EC008C',
    s8.b_assist || s8.b_bomber || s8.bomber || '#10B981',
  ];

  // Resolve Team A & Team B from SheetData (Sheet H2H by default, or Custom / Top 2)
  const allTeams = sheetData?.allTeamsFull || [];
  let teamA: any = allTeams[custom?.pAIdx ?? 0] || allTeams[0] || {
    name: 'LOADING...',
    tag: '---',
    rank: 1,
    kills: 0,
    damage: 0,
    hs: 0,
    assist: 0,
    total: 0,
    col: '#8B5CF6',
  };

  let teamB: any = allTeams[custom?.pBIdx ?? 1] || allTeams[1] || {
    name: 'LOADING...',
    tag: '---',
    rank: 2,
    kills: 0,
    damage: 0,
    hs: 0,
    assist: 0,
    total: 0,
    col: '#F43F5E',
  };

  if ((source === 'sheet_h2h_polar' || source === 'role_avg') && sheetData?.h2hMatch5?.a && sheetData?.h2hMatch5?.b) {
    const matchA = allTeams.find((t) => t.tag === sheetData.h2hMatch5!.a.tag || t.name === sheetData.h2hMatch5!.a.name);
    const matchB = allTeams.find((t) => t.tag === sheetData.h2hMatch5!.b.tag || t.name === sheetData.h2hMatch5!.b.name);
    teamA = {
      ...sheetData.h2hMatch5.a,
      logoUrl: sheetData.h2hMatch5.a.logoUrl || matchA?.logoUrl,
      assist: sheetData.h2hMatch5.a.assist ?? Math.round(sheetData.h2hMatch5.a.kills * 0.44),
    };
    teamB = {
      ...sheetData.h2hMatch5.b,
      logoUrl: sheetData.h2hMatch5.b.logoUrl || matchB?.logoUrl,
      assist: sheetData.h2hMatch5.b.assist ?? Math.round(sheetData.h2hMatch5.b.kills * 0.44),
    };
  } else if (source === 'day_top2_polar' && allTeams.length >= 2) {
    teamA = allTeams[0];
    teamB = allTeams[1];
  }

  const assistA = teamA.assist || Math.round(teamA.kills * 0.44);
  const assistB = teamB.assist || Math.round(teamB.kills * 0.44);

  // Compute normalized radii for visual balance between Kills (tens) and Damage (tens of thousands)
  const maxK = Math.max(teamA.kills, teamB.kills, 1);
  const maxD = Math.max(teamA.damage, teamB.damage, 1);
  const maxH = Math.max(teamA.hs, teamB.hs, 1);
  const maxA = Math.max(assistA, assistB, 1);

  const radiusA = [
    Math.max(28, Math.round((teamA.kills / (maxK * 1.15)) * 100)),
    Math.max(28, Math.round((teamA.damage / (maxD * 1.15)) * 100)),
    Math.max(28, Math.round((teamA.hs / (maxH * 1.15)) * 100)),
    Math.max(28, Math.round((assistA / (maxA * 1.15)) * 100)),
  ];

  const radiusB = [
    Math.max(28, Math.round((teamB.kills / (maxK * 1.15)) * 100)),
    Math.max(28, Math.round((teamB.damage / (maxD * 1.15)) * 100)),
    Math.max(28, Math.round((teamB.hs / (maxH * 1.15)) * 100)),
    Math.max(28, Math.round((assistB / (maxA * 1.15)) * 100)),
  ];

  const realA = [teamA.kills, teamA.damage, teamA.hs, assistA];
  const realB = [teamB.kills, teamB.damage, teamB.hs, assistB];

  const isRoleAvgMode = source === 'role_total';
  const displayLabels = isRoleAvgMode ? ['Rusher', 'Support', 'Sniper', 'Bomber'] : METRIC_LABELS;

  const currentDataA = isRoleAvgMode ? (sheetData?.rolesPolar?.map((r) => r.kills) || [0, 0, 0, 0]) : radiusA;
  const currentDataB = isRoleAvgMode ? (sheetData?.rolesPolar?.map((r) => r.damage) || [0, 0, 0, 0]) : radiusB;
  const displayRealA = isRoleAvgMode ? currentDataA : realA;
  const displayRealB = isRoleAvgMode ? currentDataB : realB;

  const latestRef = useRef({
    labels: displayLabels,
    realA: displayRealA,
    realB: displayRealB,
    dataA: currentDataA,
    dataB: currentDataB,
    roleColsA,
    roleColsB,
    teamA,
    teamB,
  });

  useEffect(() => {
    latestRef.current = {
      labels: displayLabels,
      realA: displayRealA,
      realB: displayRealB,
      dataA: currentDataA,
      dataB: currentDataB,
      roleColsA,
      roleColsB,
      teamA,
      teamB,
    };
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

    const {
      labels: curLabels,
      dataA: curDataA,
      dataB: curDataB,
      roleColsA: curColsA,
      roleColsB: curColsB,
    } = latestRef.current;

    // Pure White Value Plugin for Polar Area Charts with Anti-Collision Radial Offset
    const polarValuePlugin = {
      id: 'polarValuePlugin',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = '800 22px "GFF Latin", "Teko", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const side = chart._side || 'a';
        const realVals = side === 'a' ? latestRef.current.realA : latestRef.current.realB;
        const cx = chartArea ? (chartArea.left + chartArea.right) / 2 : chart.width / 2;
        const cy = chartArea ? (chartArea.top + chartArea.bottom) / 2 : chart.height / 2;
        const placed: Array<{ x1: number; x2: number; y1: number; y2: number }> = [];

        chart.data.datasets.forEach((ds: any, dsIdx: number) => {
          const meta = chart.getDatasetMeta(dsIdx);
          if (meta.hidden) return;
          meta.data.forEach((el: any, i: number) => {
            const raw = realVals[i] ?? ds.data[i];
            if (raw === 0 || raw == null) return;
            const pos = el.tooltipPosition();
            const fullTxt = formatNumber(raw);
            const halfW = ctx.measureText(fullTxt).width / 2 + 6;
            const dx = pos.x - cx;
            const dy = pos.y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;

            let tx = pos.x;
            let ty = pos.y;
            for (let attempt = 0; attempt < 4; attempt++) {
              const box = { x1: tx - halfW, x2: tx + halfW, y1: ty - 13, y2: ty + 13 };
              const hits = placed.some(
                (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2)
              );
              if (!hits) break;
              // Step outward along wedge direction and slightly separate vertically
              tx += ux * 24;
              ty += uy * 24 + (i % 2 === 0 ? -12 : 12);
            }
            placed.push({ x1: tx - halfW, x2: tx + halfW, y1: ty - 13, y2: ty + 13 });

            ctx.fillStyle = '#ffffff'; // Always crisp pure white text
            ctx.strokeStyle = 'rgba(9,11,18,0.96)';
            ctx.lineWidth = 4.5;
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 6;
            ctx.strokeText(fullTxt, tx, ty);
            ctx.fillText(fullTxt, tx, ty);
            ctx.shadowBlur = 0;
          });
        });
        ctx.restore();
      },
    };

    const mk = (canvas: HTMLCanvasElement, data: number[], cols: string[], side: 'a' | 'b') => {
      const chartInstance: any = new Chart(canvas, {
        type: 'polarArea',
        data: {
          labels: curLabels,
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
          animation: { animateRotate: true, animateScale: true, duration: 1800 },
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
              const metricKeys = ['kills', 'damage', 'hs', 'assist'];
              const baseKey = metricKeys[idx % 4];
              const key = `${side}_${baseKey}`;
              const t = side === 'a' ? latestRef.current.teamA : latestRef.current.teamB;
              onElementClick(
                evt.nativeEvent,
                's8',
                key,
                `${t.name} (${side === 'a' ? 'Team A' : 'Team B'}): ${METRIC_LABELS[idx]}`
              );
            }
          },
          scales: {
            r: {
              grid: { color: 'rgba(148,163,184,0.18)' },
              angleLines: { color: 'rgba(148,163,184,0.25)' },
              ticks: { display: false },
              suggestedMin: 0,
              suggestedMax: 100,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item: any) => {
                  const idx = item.dataIndex;
                  const lbl = METRIC_LABELS[idx] || item.label;
                  const val = side === 'a' ? latestRef.current.realA[idx] : latestRef.current.realB[idx];
                  return `${lbl}: ${formatNumber(val)}`;
                },
              },
            },
          },
        },
      });
      chartInstance._side = side;
      return chartInstance;
    };

    chart1Ref.current = mk(c1, curDataA, curColsA, 'a');
    chart2Ref.current = mk(c2, curDataB, curColsB, 'b');

    return () => {
      clearTimeout(animTimer);
      chart1Ref.current?.destroy();
      chart2Ref.current?.destroy();
      chart1Ref.current = null;
      chart2Ref.current = null;
    };
  }, [replayKey]);

  // 2. Data & Theme Background Update: Update in-place silently ('none') to prevent Polar animation glitching
  useEffect(() => {
    if (chart1Ref.current) {
      chart1Ref.current.data.labels = displayLabels;
      if (chart1Ref.current.data.datasets[0]) {
        chart1Ref.current.data.datasets[0].data = currentDataA;
        chart1Ref.current.data.datasets[0].backgroundColor = roleColsA.map((c) => `${c}D9`);
        const meta = chart1Ref.current.getDatasetMeta(0);
        if (meta) {
          meta.data.forEach((el: any, i: number) => {
            if (el.options) el.options.backgroundColor = `${roleColsA[i % roleColsA.length]}D9`;
          });
        }
      }
      chart1Ref.current.update('none');
    }
    if (chart2Ref.current) {
      chart2Ref.current.data.labels = displayLabels;
      if (chart2Ref.current.data.datasets[0]) {
        chart2Ref.current.data.datasets[0].data = currentDataB;
        chart2Ref.current.data.datasets[0].backgroundColor = roleColsB.map((c) => `${c}D9`);
        const meta = chart2Ref.current.getDatasetMeta(0);
        if (meta) {
          meta.data.forEach((el: any, i: number) => {
            if (el.options) el.options.backgroundColor = `${roleColsB[i % roleColsB.length]}D9`;
          });
        }
      }
      chart2Ref.current.update('none');
    }
  }, [
    displayLabels.join(','),
    currentDataA.join(','),
    currentDataB.join(','),
    displayRealA.join(','),
    displayRealB.join(','),
    roleColsA.join(','),
    roleColsB.join(','),
  ]);

  return (
    <div className="w-full max-w-[1340px] pt-10 flex flex-col gap-5 relative font-hud select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Polar Card A (Left Circle - Team A) */}
        <div
          className={`hud-card rounded-2xl p-5 relative flex flex-col items-center transition-all duration-700 ${
            animated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {/* Transparent Team A Header */}
          <div className="flex justify-between items-center w-full mb-3">
            <div className="relative px-3 py-1.5 rounded-xl bg-transparent border border-white/25 font-hud text-xs sm:text-sm font-bold text-white flex items-center gap-2.5">
              <TeamLogoBadge tag={teamA.tag} name={teamA.name} logoUrl={teamA.logoUrl} sizeCls="w-9 h-9" textSizeCls="text-sm" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-black">#{teamA.rank}</span>
                  <span className="font-extrabold tracking-wide uppercase">{teamA.name}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium tracking-wider">TEAM A • {teamA.tag}</span>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg font-hud text-xs sm:text-sm font-extrabold text-black flex items-center gap-1.5"
              style={{ backgroundColor: roleColsA[0] }}
            >
              <span className="text-white">PTS:</span>
              <span className="text-black font-black bg-white/90 px-1.5 rounded">{teamA.total}</span>
            </div>
          </div>

          {/* Canvas (Graph First) */}
          <div className="relative h-[340px] sm:h-[390px] w-full">
            <canvas ref={canvas1Ref} className="cursor-pointer" />
          </div>

          {/* Left Circle Metric Selectors & Value Pills (Moved BELOW Graph, Transparent) */}
          <div className="grid grid-cols-4 gap-1.5 w-full mt-3">
            {[
              { key: 'a_kills', label: 'KILLS', val: teamA.kills, col: roleColsA[0] },
              { key: 'a_damage', label: 'DMG', val: teamA.damage, col: roleColsA[1] },
              { key: 'a_hs', label: 'HS', val: teamA.hs, col: roleColsA[2] },
              { key: 'a_assist', label: 'AST', val: assistA, col: roleColsA[3] },
            ].map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={(e) =>
                  onElementClick?.(e, 's8', metric.key, `${teamA.name} (Team A): ${metric.label} Color`)
                }
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-transparent border border-white/20 hover:border-white/50 font-hud cursor-pointer transition-all hover:scale-[1.02]"
                title={`Click to change Team A ${metric.label} color`}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.col }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: metric.col }}>
                    {metric.label}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{formatNumber(metric.val)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Polar Card B (Right Circle - Team B) */}
        <div
          className={`hud-card rounded-2xl p-5 relative flex flex-col items-center transition-all duration-700 ${
            animated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
          style={{ transitionDelay: '0.12s' }}
        >
          {/* Transparent Team B Header */}
          <div className="flex justify-between items-center w-full mb-3">
            <div className="relative px-3 py-1.5 rounded-xl bg-transparent border border-white/25 font-hud text-xs sm:text-sm font-bold text-white flex items-center gap-2.5">
              <TeamLogoBadge tag={teamB.tag} name={teamB.name} logoUrl={teamB.logoUrl} sizeCls="w-9 h-9" textSizeCls="text-sm" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-black">#{teamB.rank}</span>
                  <span className="font-extrabold tracking-wide uppercase">{teamB.name}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium tracking-wider">TEAM B • {teamB.tag}</span>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg font-hud text-xs sm:text-sm font-extrabold text-black flex items-center gap-1.5"
              style={{ backgroundColor: roleColsB[0] }}
            >
              <span className="text-white">PTS:</span>
              <span className="text-black font-black bg-white/90 px-1.5 rounded">{teamB.total}</span>
            </div>
          </div>

          {/* Canvas (Graph First) */}
          <div className="relative h-[340px] sm:h-[390px] w-full">
            <canvas ref={canvas2Ref} className="cursor-pointer" />
          </div>

          {/* Right Circle Metric Selectors & Value Pills (Moved BELOW Graph, Transparent) */}
          <div className="grid grid-cols-4 gap-1.5 w-full mt-3">
            {[
              { key: 'b_kills', label: 'KILLS', val: teamB.kills, col: roleColsB[0] },
              { key: 'b_damage', label: 'DMG', val: teamB.damage, col: roleColsB[1] },
              { key: 'b_hs', label: 'HS', val: teamB.hs, col: roleColsB[2] },
              { key: 'b_assist', label: 'AST', val: assistB, col: roleColsB[3] },
            ].map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={(e) =>
                  onElementClick?.(e, 's8', metric.key, `${teamB.name} (Team B): ${metric.label} Color`)
                }
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-transparent border border-white/20 hover:border-white/50 font-hud cursor-pointer transition-all hover:scale-[1.02]"
                title={`Click to change Team B ${metric.label} color`}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.col }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: metric.col }}>
                    {metric.label}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{formatNumber(metric.val)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
