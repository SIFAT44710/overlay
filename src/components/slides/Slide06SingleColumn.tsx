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

export default function Slide06SingleColumn({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

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

  // Store latest refs so custom plugins always read current state
  const latestDataRef = useRef({ cfg, barColors, teamLogoMap });
  useEffect(() => {
    latestDataRef.current = { cfg, barColors, teamLogoMap };
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

  // 1. Initial Mount & Replay: create Chart instance ONCE
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

    const { cfg: currentCfg, barColors: currentCols, teamLogoMap: currentLogos } = latestDataRef.current;

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

        const cur = latestDataRef.current;
        cur.cfg.tags.forEach((tag, i) => {
          const cx = xScale.getPixelForValue(i);
          const col = cur.barColors[i % cur.barColors.length];
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
              // Do NOT set crossOrigin='anonymous' to prevent Google Drive / ui-avatars CORS errors
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
            data: currentCfg.vals,
            backgroundColor: currentCols.slice(0, currentCfg.tags.length),
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
          duration: 1350,
          delay: (c: any) => c.dataIndex * 80,
          easing: 'easeOutBounce',
        },
        layout: {
          padding: {
            top: 48,
            bottom: 132,
            left: 10,
            right: 10,
          },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(148,163,184,0.18)' },
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
              title: (items: any) => latestDataRef.current.cfg.names[items[0].dataIndex] || items[0].label,
              label: (item: any) => `Value: ${formatNumber(item.raw)}`,
            },
          },
        },
      },
      plugins: [valuePlugin, logoAxisPlugin],
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

  // 2. Data & Theme Background Update: Update in-place silently WITHOUT rebuilding or re-animating
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    chart.data.labels = cfg.tags;
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].data = cfg.vals;
      chart.data.datasets[0].backgroundColor = barColors.slice(0, cfg.tags.length);
    }
    chart.update('none');
  }, [cfg.tags.join(','), cfg.vals.join(','), barColors.join(',')]);

  const leaderTag = cfg.tags[0] || 'TOP';
  const leaderName = cfg.names[0] || 'RAAD VAI YT';
  const leaderLogo = teamLogoMap[leaderTag.toUpperCase()] || teamLogoMap[leaderName.toUpperCase()];

  return (
    <div className="w-full max-w-[1340px] pt-14 relative font-hud select-none">
      {/* Top-Right Compact Leader Pill with Smooth Entrance Animation */}
      <div className="absolute top-1 right-3 sm:right-6 z-30">
        <div
          className={`relative px-3 py-1 rounded-lg bg-slate-950/90 border border-purple-400/80 font-hud text-sm sm:text-base font-bold text-white flex items-center gap-2.5 shadow-xl transition-all duration-700 cursor-pointer hover:border-amber-400 ${
            animated ? 'top1-hero-glow top1-scale opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 scale-95'
          }`}
          onClick={(e) => onElementClick?.(e, 's5', 'c0', `${cfg.tags[0]} Leader Color`)}
          title={`Click to change ${cfg.tags[0]} leader color`}
        >
          <SpiritFireCanvas />
          <TeamLogoBadge
            tag={leaderTag}
            name={leaderName}
            logoUrl={leaderLogo}
            color={barColors[0]}
            sizeCls="w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="text-amber-400 font-extrabold text-xs sm:text-sm">{cfg.badge}</span>
          <span className="font-extrabold truncate max-w-[200px]">{cfg.leader}</span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-xs sm:text-sm">
            {cfg.valTxt}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-[460px] sm:h-[540px] w-full">
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            const chart = chartInstanceRef.current;
            if (!chart) return;
            let elements = chart.getElementsAtEventForMode(
              e.nativeEvent,
              'nearest',
              { intersect: true },
              false
            );
            if (!elements.length) {
              elements = chart.getElementsAtEventForMode(
                e.nativeEvent,
                'index',
                { intersect: false },
                false
              );
            }
            if (elements.length > 0) {
              const idx = elements[0].index;
              onElementClick?.(
                e,
                's5',
                `c${idx}`,
                `${cfg.tags[idx]} Candle Color`
              );
            }
          }}
        />
      </div>
    </div>
  );
}
