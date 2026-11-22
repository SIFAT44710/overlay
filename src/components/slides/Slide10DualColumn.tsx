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

export default function Slide10DualColumn({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const themeS9 = theme?.s9 || { kills: '#F5B700', damage: '#38BDF8' };
  const source = theme?.sources?.[9] || 'day_kd_12';

  const list = sheetData?.teamKillsDmg12 || [
    { tag: 'TOP', name: 'RAAD VAI YT', kills: 94, dmg: 57261, col: '#F5B700' },
    { tag: 'EXE', name: 'EXTREME EX', kills: 76, dmg: 42349, col: '#E11D48' },
    { tag: 'S9x', name: 'SNEAKY9X', kills: 62, dmg: 41088, col: '#8B5CF6' },
    { tag: 'CME', name: 'COFFIN MAKERS', kills: 58, dmg: 44026, col: '#2DD4BF' },
    { tag: 'TRX', name: 'TITANOVA REX', kills: 49, dmg: 31573, col: '#38BDF8' },
    { tag: 'UEO', name: 'TEAM UNIONIZED', kills: 50, dmg: 29641, col: '#6366F1' },
    { tag: 'NK', name: 'NOVA KNIGHT', kills: 46, dmg: 27420, col: '#A78BFA' },
    { tag: '69', name: '69 ESPORTS', kills: 48, dmg: 27036, col: '#F43F5E' },
    { tag: 'JG', name: 'JUMA GAMING', kills: 35, dmg: 22180, col: '#14B8A6' },
    { tag: 'ITZ', name: 'ITZ KABBO', kills: 22, dmg: 16450, col: '#60A5FA' },
    { tag: 'EGL', name: 'TEAM EAGLE', kills: 16, dmg: 14210, col: '#94A3B8' },
    { tag: 'SG', name: 'SADIA GAMING', kills: 0, dmg: 892, col: '#64748B' },
  ];

  const st12 = sheetData?.standing12 || [];
  const m5 = sheetData?.mapStandingM5 || [];
  const pl = sheetData?.dayTop10Players || [];
  const hs12 =
    sheetData?.allTeamsFull && sheetData.allTeamsFull.length > 0
      ? sheetData.allTeamsFull.map((t) => t.hs)
      : [89, 67, 51, 70, 61, 41, 51, 65, 44, 47, 24, 3];

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

  let cfg = {
    badge: '#1 KILLS & DMG LEADER',
    leader: `${list[0]?.name || 'RAAD VAI YT'} (${list[0]?.tag || 'TOP'})`,
    valTxt: `${formatNumber(list[0]?.kills)} KILLS • ${formatNumber(list[0]?.dmg)} DMG`,
    lbl1: 'TOTAL KILLS',
    lbl2: 'TOTAL DAMAGE',
    tags: list.map((t) => t.tag),
    names: list.map((t) => t.name),
    cols: list.map((t) => t.col),
    d1: list.map((t) => t.kills),
    d2: list.map((t) => t.dmg),
  };

  if (source === 'day_surv_kill' && st12.length > 0) {
    cfg = {
      badge: '#1 PLACEMENT & KILLS',
      leader: `${st12[0].name} (${st12[0].tag})`,
      valTxt: `${formatNumber(st12[0].place)} PLACE • ${formatNumber(st12[0].elims)} KILLS`,
      lbl1: 'SURVIVAL PTS',
      lbl2: 'KILL PTS',
      tags: st12.map((t) => t.tag),
      names: st12.map((t) => t.name),
      cols: list.map((t) => t.col),
      d1: st12.map((t) => t.place),
      d2: st12.map((t) => t.elims),
    };
  } else if (source === 'day_kill_hs' && list.length > 0) {
    cfg = {
      badge: '#1 KILLS & HEADSHOTS',
      leader: `${list[0].name} (${list[0].tag})`,
      valTxt: `${formatNumber(list[0].kills)} KILLS • ${hs12[0]} HS`,
      lbl1: 'TOTAL KILLS',
      lbl2: 'HEADSHOTS',
      tags: list.map((t) => t.tag),
      names: list.map((t) => t.name),
      cols: list.map((t) => t.col),
      d1: list.map((t) => t.kills),
      d2: hs12,
    };
  } else if (source === 'm5_surv_kill' && m5.length > 0) {
    cfg = {
      badge: '#1 MATCH 5 STANDING',
      leader: `${m5[0].name} (${m5[0].tag})`,
      valTxt: `${formatNumber(m5[0].surv)} PLACE • ${formatNumber(m5[0].kill)} KILLS`,
      lbl1: 'M5 SURVIVAL',
      lbl2: 'M5 KILLS',
      tags: m5.map((t) => t.tag),
      names: m5.map((t) => t.name),
      cols: list.slice(0, m5.length).map((t) => t.col),
      d1: m5.map((t) => t.surv),
      d2: m5.map((t) => t.kill),
    };
  } else if (source === 'plrs_kd' && pl.length > 0) {
    cfg = {
      badge: '#1 PLAYER KILLS & DMG',
      leader: pl[0].name,
      valTxt: `${formatNumber(pl[0].kills)} KILLS • ${formatNumber(pl[0].dmg)} DMG`,
      lbl1: 'PLAYER KILLS',
      lbl2: 'PLAYER DAMAGE',
      tags: pl.map((p) => p.tag),
      names: pl.map((p) => `${p.name} (${p.team})`),
      cols: list.slice(0, pl.length).map((t) => t.col),
      d1: pl.map((p) => p.kills),
      d2: pl.map((p) => p.dmg),
    };
  } else if (source === 'plrs_k_hs' && pl.length > 0) {
    cfg = {
      badge: '#1 PLAYER KILLS & HS',
      leader: pl[0].name,
      valTxt: `${formatNumber(pl[0].kills)} KILLS • ${pl[0].hs} HS`,
      lbl1: 'PLAYER KILLS',
      lbl2: 'HEADSHOTS',
      tags: pl.map((p) => p.tag),
      names: pl.map((p) => `${p.name} (${p.team})`),
      cols: list.slice(0, pl.length).map((t) => t.col),
      d1: pl.map((p) => p.kills),
      d2: pl.map((p) => p.hs),
    };
  }

  const latestRef = useRef({ cfg, themeS9, teamLogoMap });
  useEffect(() => {
    latestRef.current = { cfg, themeS9, teamLogoMap };
  });

  // 1. Initial Mount & ReplayKey: Create Chart ONCE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up any stale chart on this canvas
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const { cfg: currentCfg, themeS9: currentTheme } = latestRef.current;

    // Custom Plugin: Exact Comma Full Numbers (Zero 'K')
    const valuePlugin = {
      id: 'dualValuePlugin',
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
      id: 'dualLogoAxisPlugin',
      afterDraw(chart: any) {
        const { ctx, scales } = chart;
        const xScale = scales.x;
        if (!xScale) return;
        const yBase = chart.chartArea.bottom + 14;
        ctx.save();

        const cur = latestRef.current;
        cur.cfg.tags.forEach((tag, i) => {
          const cx = xScale.getPixelForValue(i);
          const col = cur.cfg.cols[i % cur.cfg.cols.length] || '#8b5cf6';
          const isLight = col === '#F5B700' || col === '#2DD4BF' || col === '#00DF82';
          const r = 36; // 72px diameter
          const cy = yBase + r;

          const logoUrl =
            cur.teamLogoMap[tag.toUpperCase()] ||
            cur.teamLogoMap[cur.cfg.names[i]?.toUpperCase()] ||
            '';
          let img: HTMLImageElement | undefined;
          if (logoUrl) {
            if (!imgCacheRef.current.has(logoUrl)) {
              const newImg = new Image();
              // Do NOT set crossOrigin='anonymous' to avoid CORS block
              newImg.src = logoUrl;
              newImg.onload = () => {
                if (chartInstanceRef.current) {
                  chartInstanceRef.current.draw();
                }
              };
              imgCacheRef.current.set(logoUrl, newImg);
            }
            img = imgCacheRef.current.get(logoUrl);
          }

          if (img && img.complete && img.naturalWidth > 0) {
            // Draw round hex/circle shield with glow & real Drive Logo
            ctx.save();
            ctx.shadowColor = col;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0c16';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 3;
            ctx.strokeStyle = col;
            ctx.stroke();

            // Clip & draw image
            ctx.beginPath();
            ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, cx - (r - 3), cy - (r - 3), (r - 3) * 2, (r - 3) * 2);
            ctx.restore();
          } else {
            // Fallback: High-contrast hexagon shield with team tag initials
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
          }

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
        labels: currentCfg.tags,
        datasets: [
          {
            label: currentCfg.lbl1,
            data: currentCfg.d1,
            backgroundColor: currentTheme.kills,
            borderRadius: 8,
            yAxisID: 'y',
            barPercentage: 0.86,
            categoryPercentage: 0.72,
          },
          {
            label: currentCfg.lbl2,
            data: currentCfg.d2,
            backgroundColor: currentTheme.damage,
            borderRadius: 8,
            yAxisID: 'y1',
            barPercentage: 0.86,
            categoryPercentage: 0.72,
          },
        ],
      },
      plugins: [valuePlugin, logoAxisPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt: any, elems: any[]) => {
          if (!elems.length || !onElementClick) return;
          const dsIdx = elems[0].datasetIndex;
          if (dsIdx === 0) {
            onElementClick(evt.nativeEvent, 's9', 'kills', `${latestRef.current.cfg.lbl1} Candle`);
          } else {
            onElementClick(evt.nativeEvent, 's9', 'damage', `${latestRef.current.cfg.lbl2} Candle`);
          }
        },
        layout: { padding: { top: 48, bottom: 132, left: 10, right: 10 } },
        animation: {
          duration: 1350,
          delay: (c: any) => c.dataIndex * 80 + c.datasetIndex * 55,
          easing: 'easeOutBounce',
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
              title: (items: any) => latestRef.current.cfg.names[items[0].dataIndex] || items[0].label,
              label: (item: any) => `${item.dataset.label}: ${formatNumber(item.raw)}`,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            position: 'left',
            beginAtZero: true,
            grid: { color: 'rgba(100,116,139,0.32)' },
            title: {
              display: true,
              text: currentCfg.lbl1,
              color: currentTheme.kills,
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: '#fde047',
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => formatNumber(v),
            },
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            grid: { display: false },
            title: {
              display: true,
              text: currentCfg.lbl2,
              color: currentTheme.damage,
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: '#7dd3fc',
              font: { size: 18, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => formatNumber(v),
            },
          },
        },
      },
    });

    chartInstanceRef.current = newChart;

    return () => {
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
    chart.data.labels = cfg.tags;
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].data = cfg.d1;
      chart.data.datasets[0].label = cfg.lbl1;
      chart.data.datasets[0].backgroundColor = themeS9.kills;
    }
    if (chart.data.datasets[1]) {
      chart.data.datasets[1].data = cfg.d2;
      chart.data.datasets[1].label = cfg.lbl2;
      chart.data.datasets[1].backgroundColor = themeS9.damage;
    }
    chart.update('none');
  }, [cfg.tags.join(','), cfg.d1.join(','), cfg.d2.join(','), themeS9.kills, themeS9.damage]);

  return (
    <div className="w-full max-w-[1340px] pt-18 relative font-hud select-none">
      {/* Top Header Row with Leader Badge & Legend */}
      <div className="absolute top-1 inset-x-3 sm:inset-x-6 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="relative px-4 py-1.5 rounded-xl bg-slate-950/90 border border-purple-400 font-hud text-2xl sm:text-3xl font-bold text-white flex items-center gap-3.5 shadow-2xl top1-hero-glow">
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={cfg.tags[0]}
            name={cfg.names[0]}
            logoUrl={teamLogoMap[cfg.tags[0]?.toUpperCase()] || teamLogoMap[cfg.names[0]?.toUpperCase()]}
            color={cfg.cols[0]}
            sizeCls="w-16 h-16"
          />
          <span className="text-amber-400 font-extrabold">{cfg.badge}</span>
          <span className="font-extrabold">{cfg.leader}</span>
          <span className="px-3.5 py-0.5 rounded bg-amber-400 text-black font-extrabold text-2xl sm:text-3xl">
            {cfg.valTxt}
          </span>
        </div>

        <div className="flex items-center gap-4 font-hud text-xl sm:text-2xl font-bold">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: themeS9.kills }} />
            <span style={{ color: themeS9.kills }}>{cfg.lbl1}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: themeS9.damage }} />
            <span style={{ color: themeS9.damage }}>{cfg.lbl2}</span>
          </span>
        </div>
      </div>

      <div className="relative h-[460px] sm:h-[540px] w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
