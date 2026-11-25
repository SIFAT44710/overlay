'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [animated, setAnimated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const themeS9 = theme?.s9 || { kills: '#F5B700', damage: '#38BDF8' };
  const source = theme?.sources?.[8] || theme?.sources?.[9] || 'day_kd_12';

  const list = sheetData?.teamKillsDmg12 || Array.from({ length: 12 }, () => ({
    tag: '---',
    name: 'LOADING...',
    kills: 0,
    dmg: 0,
    col: '#F5B700',
  }));

  const st12 = sheetData?.standing12 || [];
  const m5 = sheetData?.mapStandingM5 || [];
  const pl = sheetData?.dayTop10Players || [];
  const hs12 =
    sheetData?.allTeamsFull && sheetData.allTeamsFull.length > 0
      ? sheetData.allTeamsFull.map((t) => t.hs)
      : [89, 67, 51, 70, 61, 41, 51, 65, 44, 47, 24, 3];

  // Resolve Drive Logo for each team with full tag & name coverage
  const teamLogoMap: Record<string, string> = {};
  const registerLogo = (tag?: string, name?: string, url?: string) => {
    if (!url) return;
    if (tag) {
      teamLogoMap[tag.toUpperCase()] = url;
      teamLogoMap[tag.toLowerCase()] = url;
      teamLogoMap[tag] = url;
    }
    if (name) {
      teamLogoMap[name.toUpperCase()] = url;
      teamLogoMap[name.toLowerCase()] = url;
      teamLogoMap[name] = url;
    }
  };

  if (sheetData?.standing12) {
    sheetData.standing12.forEach((st) => registerLogo(st.tag, st.name, st.logoUrl));
  }
  if (sheetData?.allTeamsFull) {
    sheetData.allTeamsFull.forEach((t) => registerLogo(t.tag, t.name, t.logoUrl));
  }
  if (sheetData?.teamKillsDmg12) {
    sheetData.teamKillsDmg12.forEach((t) => registerLogo(t.tag, t.name, (t as any).logoUrl));
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
  latestRef.current = { cfg, themeS9, teamLogoMap };
  useEffect(() => {
    latestRef.current = { cfg, themeS9, teamLogoMap };
  });

  // Preload team logos into cache immediately for instant rendering without delays
  useEffect(() => {
    Object.values(teamLogoMap).forEach((url) => {
      if (url && typeof url === 'string' && !imgCacheRef.current.has(url)) {
        const newImg = new Image();
        newImg.src = url;
        newImg.onload = () => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.draw();
          }
        };
        imgCacheRef.current.set(url, newImg);
      }
    });
  }, [teamLogoMap]);

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

    const { cfg: currentCfg, themeS9: currentTheme } = latestRef.current;

    // Custom Plugin: Large 24px Numbers cleanly positioned above each candle with Guaranteed Zero Overlap
    const valuePlugin = {
      id: 'dualValuePlugin',
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        ctx.save();

        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);
        if (!meta0 || !meta1) {
          ctx.restore();
          return;
        }

        const ds0 = chart.data.datasets[0];
        const ds1 = chart.data.datasets[1];
        const total = Math.max(meta0.data.length, meta1.data.length);

        ctx.font = '800 24px "GFF Latin", "Teko", sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.96)';

        for (let i = 0; i < total; i++) {
          const el0 = meta0.data[i];
          const el1 = meta1.data[i];
          const raw0 = ds0?.data[i];
          const raw1 = ds1?.data[i];

          const p0 = el0 ? el0.tooltipPosition() : null;
          const p1 = el1 ? el1.tooltipPosition() : null;

          const has0 = raw0 != null && raw0 > 0 && p0;
          const has1 = raw1 != null && raw1 > 0 && p1;

          const txt0 = has0 ? formatNumber(raw0) : '';
          const txt1 = has1 ? formatNumber(raw1) : '';

          const w0 = has0 ? ctx.measureText(txt0).width : 0;
          const w1 = has1 ? ctx.measureText(txt1).width : 0;

          // Default: Centered directly over the top of each candle
          let x0 = p0 ? p0.x - 2 : 0;
          let x1 = p1 ? p1.x : 0;
          let y0 = p0 ? p0.y - 12 : 0;
          let y1 = p1 ? p1.y - 12 : 0;

          if (has0 && has1 && p0 && p1) {
            // Check horizontal overlap between yellow number bounds and blue number bounds
            const right0 = x0 + w0 / 2;
            const left1 = x1 - w1 / 2;
            const hOverlap = right0 - left1; // Positive if bounds overlap
            const vDist = Math.abs(y0 - y1);

            // Guaranteed Zero Collision: If labels are close horizontally (or overlapping) AND close vertically:
            // Elevate the Damage (blue) label cleanly above Kills so they NEVER collide or merge into each other
            if (hOverlap > -10 && vDist < 38) {
              y1 = Math.min(y0, y1) - 26;
            }
          }

          // Draw Yellow (Kills) label cleanly centered directly above yellow candle with neon glow
          const liveKillsCol = latestRef.current.themeS9.kills;
          const liveDamageCol = latestRef.current.themeS9.damage;

          if (has0) {
            ctx.textAlign = 'center';
            ctx.fillStyle = liveKillsCol;
            ctx.shadowColor = liveKillsCol;
            ctx.shadowBlur = 8;
            ctx.strokeText(txt0, x0, y0);
            ctx.fillText(txt0, x0, y0);
            ctx.shadowBlur = 0;
          }

          // Draw Blue (Damage) label cleanly centered directly above blue candle with neon glow
          if (has1) {
            ctx.textAlign = 'center';
            ctx.fillStyle = liveDamageCol;
            ctx.shadowColor = liveDamageCol;
            ctx.shadowBlur = 8;
            ctx.strokeText(txt1, x1, y1);
            ctx.fillText(txt1, x1, y1);
            ctx.shadowBlur = 0;
          }
        }

        ctx.restore();
      },
    };

    // Custom Plugin: Compact 48px Bottom Team Logos + 18px Tag Names perfectly matching candle width
    const logoAxisPlugin = {
      id: 'dualLogoAxisPlugin',
      afterDraw(chart: any) {
        const { ctx, scales } = chart;
        const xScale = scales.x;
        if (!xScale) return;
        const yBase = chart.chartArea.bottom + 12;
        ctx.save();

        const cur = latestRef.current;
        cur.cfg.tags.forEach((tag, i) => {
          const cx = xScale.getPixelForValue(i);
          const col = cur.cfg.cols[i % cur.cfg.cols.length] || '#8b5cf6';
          const isLight = col === '#F5B700' || col === '#2DD4BF' || col === '#00DF82';
          const r = 24; // 48px diameter - fits candle width
          const cy = yBase + r;

          const logoUrl =
            cur.teamLogoMap[tag.toUpperCase()] ||
            cur.teamLogoMap[cur.cfg.names[i]?.toUpperCase()] ||
            '';
          let img: HTMLImageElement | undefined;
          if (logoUrl) {
            if (!imgCacheRef.current.has(logoUrl)) {
              const newImg = new Image();
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
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0c16';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = col;
            ctx.stroke();

            // Clip & draw image
            ctx.beginPath();
            ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, cx - (r - 2), cy - (r - 2), (r - 2) * 2, (r - 2) * 2);
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
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#090b10';
            ctx.stroke();

            // Team Tag letters inside hex
            ctx.font = '800 16px "GFF Latin", "Teko", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isLight ? '#090b10' : '#ffffff';
            ctx.fillText(String(tag).slice(0, 3), cx, cy + 0.5);
            ctx.restore();
          }

          // Tag Name below logo
          ctx.font = '800 18px "GFF Latin", "Teko", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.strokeStyle = 'rgba(9,11,18,0.96)';
          ctx.lineWidth = 4;
          ctx.strokeText(tag, cx, cy + r + 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(tag, cx, cy + r + 6);
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
            borderColor: 'rgba(255,255,255,0.25)',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'y',
            maxBarThickness: 36, // Thicker yellow candle
            categoryPercentage: 0.94,
            barPercentage: 0.96,
          },
          {
            label: currentCfg.lbl2,
            data: currentCfg.d2,
            backgroundColor: currentTheme.damage,
            borderColor: 'rgba(255,255,255,0.25)',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'y1',
            maxBarThickness: 16, // Slimmer blue candle
            categoryPercentage: 0.94,
            barPercentage: 0.96,
          },
        ],
      },
      plugins: [valuePlugin, logoAxisPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt: any, elems: any[]) => {
          if (!onElementClick) return;
          const chart = chartInstanceRef.current;
          if (!chart) return;
          const nativeEvt = evt?.native || evt;
          if (!nativeEvt) return;

          // 1. Direct bar hit test via Chart.js geometry: 100% accurate on candle clicks
          if (elems && elems.length > 0) {
            const dsIdx = elems[0].datasetIndex;
            if (dsIdx === 0) {
              onElementClick(
                nativeEvt,
                's9',
                'kills',
                `${latestRef.current.cfg.lbl1} (Yellow / Left Candle) Color`
              );
            } else {
              onElementClick(
                nativeEvt,
                's9',
                'damage',
                `${latestRef.current.cfg.lbl2} (Blue / Right Candle) Color`
              );
            }
            return;
          }

          // 2. Coordinate fallback: If clicked above the bar or near category
          const xScale = chart.scales.x;
          if (!xScale) return;
          const canvasEl = canvasRef.current;
          if (!canvasEl) return;
          const rect = canvasEl.getBoundingClientRect();
          const clientX = nativeEvt.clientX ?? (rect.left + (evt.x || 0));
          const clickX = clientX - rect.left;

          let clickedIdx = 0;
          let minDist = Infinity;
          const tags = latestRef.current.cfg.tags;
          for (let i = 0; i < tags.length; i++) {
            const cx = xScale.getPixelForValue(i);
            const dist = Math.abs(clickX - cx);
            if (dist < minDist) {
              minDist = dist;
              clickedIdx = i;
            }
          }

          const cx = xScale.getPixelForValue(clickedIdx);
          // Left side = Kills (Yellow) Candle; Right side = Damage (Blue) Candle
          if (clickX <= cx) {
            onElementClick(
              nativeEvt,
              's9',
              'kills',
              `${latestRef.current.cfg.lbl1} (Yellow / Left Candle) Color`
            );
          } else {
            onElementClick(
              nativeEvt,
              's9',
              'damage',
              `${latestRef.current.cfg.lbl2} (Blue / Right Candle) Color`
            );
          }
        },
        layout: { padding: { top: 75, bottom: 94, left: 10, right: 10 } },
        animation: {
          duration: 1400,
          delay: (c: any) => c.dataIndex * 85 + c.datasetIndex * 55,
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
            grace: '22%',
            grid: { color: 'rgba(100,116,139,0.25)' },
            title: {
              display: true,
              text: currentCfg.lbl1,
              color: currentTheme.kills,
              font: { size: 16, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: currentTheme.kills,
              font: { size: 16, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => formatNumber(v),
            },
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            grace: '22%',
            grid: { display: false },
            title: {
              display: true,
              text: currentCfg.lbl2,
              color: currentTheme.damage,
              font: { size: 16, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
            },
            ticks: {
              color: currentTheme.damage,
              font: { size: 16, weight: 'bold', family: '"GFF Latin", "Teko", sans-serif' },
              callback: (v: any) => formatNumber(v),
            },
          },
        },
      },
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
    chart.data.labels = cfg.tags;
    (chart.options as any).categoryPercentage = 0.94;
    (chart.options as any).barPercentage = 0.96;
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].data = cfg.d1;
      chart.data.datasets[0].label = cfg.lbl1;
      chart.data.datasets[0].backgroundColor = themeS9.kills;
      (chart.data.datasets[0] as any).maxBarThickness = 36;
      (chart.data.datasets[0] as any).categoryPercentage = 0.94;
      (chart.data.datasets[0] as any).barPercentage = 0.96;
      const meta0 = chart.getDatasetMeta(0);
      if (meta0) {
        meta0.data.forEach((el: any) => {
          if (el.options) el.options.backgroundColor = themeS9.kills;
        });
      }
    }
    if (chart.data.datasets[1]) {
      chart.data.datasets[1].data = cfg.d2;
      chart.data.datasets[1].label = cfg.lbl2;
      chart.data.datasets[1].backgroundColor = themeS9.damage;
      (chart.data.datasets[1] as any).maxBarThickness = 16;
      (chart.data.datasets[1] as any).categoryPercentage = 0.94;
      (chart.data.datasets[1] as any).barPercentage = 0.96;
      const meta1 = chart.getDatasetMeta(1);
      if (meta1) {
        meta1.data.forEach((el: any) => {
          if (el.options) el.options.backgroundColor = themeS9.damage;
        });
      }
    }
    const scales = chart.options.scales as any;
    if (scales?.y?.title) {
      scales.y.title.color = themeS9.kills;
      scales.y.title.text = cfg.lbl1;
    }
    if (scales?.y?.ticks) {
      scales.y.ticks.color = themeS9.kills;
    }
    if (scales?.y1?.title) {
      scales.y1.title.color = themeS9.damage;
      scales.y1.title.text = cfg.lbl2;
    }
    if (scales?.y1?.ticks) {
      scales.y1.ticks.color = themeS9.damage;
    }
    chart.update('none');
  }, [cfg.tags.join(','), cfg.d1.join(','), cfg.d2.join(','), themeS9.kills, themeS9.damage]);

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top Header Row with Compact Leader Badge on Left & Big Clickable Legend on Right */}
      <div
        className={`absolute top-1 inset-x-3 sm:inset-x-6 flex items-center justify-between gap-3 z-30 transition-all duration-700 ${
          animated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <div
          className={`relative px-3 py-1 rounded-lg bg-slate-950/90 border border-purple-400/80 font-hud text-sm sm:text-base font-bold text-white flex items-center gap-2.5 shadow-xl transition-all duration-700 ${
            animated ? 'top1-hero-glow top1-scale opacity-100' : 'opacity-0 scale-95'
          }`}
        >
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={cfg.tags[0]}
            name={cfg.names[0]}
            logoUrl={teamLogoMap[cfg.tags[0]?.toUpperCase()] || teamLogoMap[cfg.names[0]?.toUpperCase()]}
            color={cfg.cols[0]}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="text-amber-400 font-extrabold text-xs sm:text-sm">{cfg.badge}</span>
          <span className="font-extrabold">{cfg.leader}</span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-xs sm:text-sm">
            {cfg.valTxt}
          </span>
        </div>

        <div className="flex items-center gap-3 font-hud text-sm sm:text-base font-bold">
          <button
            type="button"
            onClick={(e) =>
              onElementClick?.(e, 's9', 'kills', `${cfg.lbl1} (Yellow Candle) Color`)
            }
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border-2 hover:brightness-125 cursor-pointer shadow-lg transition-all"
            style={{ borderColor: themeS9.kills }}
            title={`Click to change ${cfg.lbl1} (Yellow candle) color`}
          >
            <span
              className="w-3.5 h-3.5 rounded-sm shadow-sm"
              style={{ backgroundColor: themeS9.kills }}
            />
            <span style={{ color: themeS9.kills }}>{cfg.lbl1}</span>
          </button>
          <button
            type="button"
            onClick={(e) =>
              onElementClick?.(e, 's9', 'damage', `${cfg.lbl2} (Blue Candle) Color`)
            }
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border-2 hover:brightness-125 cursor-pointer shadow-lg transition-all"
            style={{ borderColor: themeS9.damage }}
            title={`Click to change ${cfg.lbl2} (Blue candle) color`}
          >
            <span
              className="w-3.5 h-3.5 rounded-sm shadow-sm"
              style={{ backgroundColor: themeS9.damage }}
            />
            <span style={{ color: themeS9.damage }}>{cfg.lbl2}</span>
          </button>
        </div>
      </div>

      <div className="relative h-[460px] sm:h-[540px] w-full">
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            const chart = chartInstanceRef.current;
            if (!chart || !onElementClick) return;

            // 1. Direct hit test via Chart.js nearest element
            let elements = chart.getElementsAtEventForMode(
              e.nativeEvent,
              'nearest',
              { intersect: true },
              false
            );
            if (!elements || elements.length === 0) {
              elements = chart.getElementsAtEventForMode(
                e.nativeEvent,
                'index',
                { intersect: false },
                false
              );
            }

            if (elements && elements.length > 0) {
              const dsIdx = elements[0].datasetIndex;
              if (dsIdx === 0) {
                onElementClick(e, 's9', 'kills', `${latestRef.current.cfg.lbl1} (Yellow / Left Candle) Color`);
              } else {
                onElementClick(e, 's9', 'damage', `${latestRef.current.cfg.lbl2} (Blue / Right Candle) Color`);
              }
              return;
            }

            // 2. Coordinate fallback: determine whether clicked on left half (Kills) or right half (Damage)
            const xScale = chart.scales.x;
            if (xScale) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              let clickedIdx = 0;
              let minDist = Infinity;
              const tags = latestRef.current.cfg.tags;
              for (let i = 0; i < tags.length; i++) {
                const cx = xScale.getPixelForValue(i);
                const dist = Math.abs(clickX - cx);
                if (dist < minDist) {
                  minDist = dist;
                  clickedIdx = i;
                }
              }
              const cx = xScale.getPixelForValue(clickedIdx);
              if (clickX <= cx) {
                onElementClick(e, 's9', 'kills', `${latestRef.current.cfg.lbl1} (Yellow / Left Candle) Color`);
              } else {
                onElementClick(e, 's9', 'damage', `${latestRef.current.cfg.lbl2} (Blue / Right Candle) Color`);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
