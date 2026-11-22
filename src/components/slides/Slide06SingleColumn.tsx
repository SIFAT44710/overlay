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

export default function Slide06SingleColumn({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const themeS5 = theme?.s5 || {};
  const source = theme?.sources?.[5] || 'day_pts';

  const defaultTags = ['TOP', 'EXE', 'S9x', 'CME', 'TRX', 'UEO', 'NK', '69', 'JG', 'ITZ', 'EGL', 'SG'];
  const defaultNames = [
    'RAAD VAI YT', 'EXTREME EX', 'SNEAKY9X', 'COFFIN MAKERS', 'TITANOVA REX',
    'TEAM UNIONIZED', 'NOVA KNIGHT', '69 ESPORTS', 'JUMA GAMING', 'ITZ KABBO',
    'TEAM EAGLE', 'SADIA GAMING',
  ];

  const barColors = Array.from({ length: 12 }, (_, idx) => (themeS5 as any)[`c${idx}`] || [
    '#F5B700', '#E11D48', '#8B5CF6', '#2DD4BF', '#38BDF8', '#6366F1',
    '#A78BFA', '#F43F5E', '#14B8A6', '#60A5FA', '#94A3B8', '#64748B',
  ][idx]);

  // Determine active dataset based on source
  let cfg = {
    badge: '#1 TOP POINTS',
    leader: 'RAAD VAI YT (TOP)',
    valTxt: '134 PTS',
    tags: defaultTags,
    names: defaultNames,
    vals: [134, 98, 96, 93, 85, 78, 69, 61, 58, 36, 33, 0],
  };

  const st12 = sheetData?.standing12 || [];
  const kd12 = sheetData?.teamKillsDmg12 || [];
  const allTeams = sheetData?.allTeamsFull || [];
  const m5 = sheetData?.mapStandingM5 || [];
  const pl = sheetData?.dayTop10Players || [];

  if (source === 'day_kills' && st12.length > 0) {
    cfg = {
      badge: '#1 TOP KILLS',
      leader: `${st12[0].name} (${st12[0].tag})`,
      valTxt: `${formatNumber(st12[0].elims)} KILLS`,
      tags: st12.map((t) => t.tag),
      names: st12.map((t) => t.name),
      vals: st12.map((t) => t.elims),
    };
  } else if (source === 'day_dmg' && kd12.length > 0) {
    cfg = {
      badge: '#1 TOP DAMAGE',
      leader: `${kd12[0].name} (${kd12[0].tag})`,
      valTxt: `${formatNumber(kd12[0].dmg)} DMG`,
      tags: kd12.map((t) => t.tag),
      names: kd12.map((t) => t.name),
      vals: kd12.map((t) => t.dmg),
    };
  } else if (source === 'day_surv' && st12.length > 0) {
    cfg = {
      badge: '#1 SURVIVAL PTS',
      leader: `${st12[0].name} (${st12[0].tag})`,
      valTxt: `${formatNumber(st12[0].place)} PLACE PTS`,
      tags: st12.map((t) => t.tag),
      names: st12.map((t) => t.name),
      vals: st12.map((t) => t.place),
    };
  } else if (source === 'day_hs' && allTeams.length > 0) {
    cfg = {
      badge: '#1 HEADSHOTS',
      leader: `${allTeams[0].name} (${allTeams[0].tag})`,
      valTxt: `${formatNumber(allTeams[0].hs)} HS`,
      tags: allTeams.map((t) => t.tag),
      names: allTeams.map((t) => t.name),
      vals: allTeams.map((t) => t.hs),
    };
  } else if (source === 'latest_m5' && m5.length > 0) {
    cfg = {
      badge: '#1 MATCH 5 PTS',
      leader: `${m5[0].name} (${m5[0].tag})`,
      valTxt: `${formatNumber(m5[0].total)} PTS`,
      tags: m5.map((t) => t.tag),
      names: m5.map((t) => t.name),
      vals: m5.map((t) => t.total),
    };
  } else if (source === 'top10_plrs' && pl.length > 0) {
    cfg = {
      badge: '#1 TOP FRAGGER',
      leader: `${pl[0].name} (${pl[0].tag})`,
      valTxt: `${formatNumber(pl[0].kills)} KILLS`,
      tags: pl.slice(0, 10).map((p) => p.name),
      names: pl.slice(0, 10).map((p) => `${p.name} - ${p.team}`),
      vals: pl.slice(0, 10).map((p) => p.kills),
    };
  } else if (st12.length > 0) {
    cfg = {
      badge: '#1 TOP POINTS',
      leader: `${st12[0].name} (${st12[0].tag})`,
      valTxt: `${formatNumber(st12[0].total)} PTS`,
      tags: st12.map((t) => t.tag),
      names: st12.map((t) => t.name),
      vals: st12.map((t) => t.total),
    };
  }

  // Resolve Drive Logo for each team
  const teamLogoMap: Record<string, string> = {};
  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => {
      if (st.logoUrl) {
        teamLogoMap[st.tag.toUpperCase()] = st.logoUrl;
        teamLogoMap[st.name.toUpperCase()] = st.logoUrl;
      }
    });
  }

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
      chart.data.labels = cfg.tags;
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].data = cfg.vals;
        chart.data.datasets[0].backgroundColor = barColors.slice(0, cfg.tags.length);
      }
      chart.update('none');
      return;
    }

    // Custom Plugin: Exact Comma Full Numbers (Zero 'K')
    const valuePlugin = {
      id: 'valuePlugin',
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
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 4.5;
            ctx.strokeText(fullTxt, pos.x, pos.y - 16);
            ctx.fillText(fullTxt, pos.x, pos.y - 16);
          });
        });
        ctx.restore();
      },
    };

    // Custom Plugin: Extra-Large 72px Bottom Team Logos + 22px Tag Names
    const logoAxisPlugin = {
      id: 'logoAxisPlugin',
      afterDraw(chart: any) {
        const { ctx, scales } = chart;
        const xScale = scales.x;
        if (!xScale) return;
        const yBase = chart.chartArea.bottom + 14;
        ctx.save();

        cfg.tags.forEach((tag, i) => {
          const cx = xScale.getPixelForValue(i);
          const col = barColors[i % barColors.length];
          const isLight = col === '#F5B700' || col === '#2DD4BF' || col === '#00DF82';
          const r = 36; // 72px diameter
          const cy = yBase + r;

          // Hexagon shield logo background
          ctx.save();
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = -Math.PI / 2 + (k * Math.PI) / 3;
            const px = cx + r * Math.cos(a);
            const py = cy + r * Math.sin(a);
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#090b10';
          ctx.stroke();

          // Team Tag letters inside hex
          ctx.font = '800 22px "GFF Latin", "Teko", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isLight ? '#090b10' : '#ffffff';
          ctx.fillText(String(tag).slice(0, 3), cx, cy + 0.5);
          ctx.restore();

          // Tag Name below logo
          ctx.font = '800 22px "GFF Latin", "Teko", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.strokeStyle = 'rgba(9,11,18,0.96)';
          ctx.lineWidth = 4.5;
          ctx.strokeText(tag, cx, cy + r + 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(tag, cx, cy + r + 8);
        });
        ctx.restore();
      },
    };

    const newChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: cfg.tags,
        datasets: [
          {
            data: cfg.vals,
            backgroundColor: barColors.slice(0, cfg.tags.length),
            borderColor: 'rgba(255,255,255,0.22)',
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1400,
          easing: 'easeOutQuart',
        },
        layout: {
          padding: {
            top: 36,
            bottom: 132, // Accommodates 72px hex logos + 22px tag labels
            left: 10,
            right: 10,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            grid: {
              color: 'rgba(148,163,184,0.18)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 20,
                weight: 'bold',
                family: '"GFF Latin", "Teko", sans-serif',
              },
              callback: (val) => formatNumber(val),
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: any) => cfg.names[items[0].dataIndex] || items[0].label,
              label: (item: any) => `Value: ${formatNumber(item.raw)}`,
            },
          },
        },
      },
      plugins: [valuePlugin, logoAxisPlugin],
    });

    chartInstanceRef.current = newChart;

    return () => {
      newChart.destroy();
      chartInstanceRef.current = null;
    };
  }, [cfg, barColors]);

  const topTeam = st12[0];

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top-Right Leader Pill */}
      {topTeam && (
        <div className="absolute top-1 right-3 sm:right-6 z-30">
          <div className="relative px-4 py-1.5 rounded-xl bg-slate-950/90 border border-purple-400/70 font-hud text-2xl sm:text-3xl font-bold text-white flex items-center gap-3.5 shadow-2xl top1-hero-glow">
            <SpiritFireCanvas />
            <TeamLogoBadge
              tag={topTeam.tag}
              name={topTeam.name}
              logoUrl={teamLogoMap[topTeam.tag.toUpperCase()] || teamLogoMap[topTeam.name.toUpperCase()]}
              color={barColors[0]}
              sizeCls="w-16 h-16"
            />
            <span className="text-amber-400 font-extrabold">{cfg.badge}</span>
            <span className="font-extrabold">{cfg.leader}</span>
            <span className="px-3.5 py-0.5 rounded bg-amber-400 text-black font-extrabold text-2xl sm:text-3xl">
              {cfg.valTxt}
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="w-full h-[520px] relative">
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            const chart = chartInstanceRef.current;
            if (!chart) return;
            const points = chart.getElementsAtEventForMode(
              e.nativeEvent,
              'nearest',
              { intersect: true },
              true
            );
            if (points.length > 0) {
              const idx = points[0].index;
              onElementClick?.(
                e,
                's5',
                `c${idx}`,
                `${cfg.tags[idx]} Bar Color`
              );
            }
          }}
        />
      </div>
    </div>
  );
}
