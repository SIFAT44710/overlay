'use client';

import React, { useEffect, useRef } from 'react';

export function startRealFireCanvas(canvas: HTMLCanvasElement | null, opts: { light?: boolean } = {}) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth || 320;
  const H = canvas.clientHeight || 110;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.scale(dpr, dpr);

  const startTime = performance.now();
  let t = 0;

  // Wispy curling spirit-flame tendrils (inspired by dark-violet/magenta spirit fire)
  const tendrilCount = Math.max(8, Math.min(18, Math.round(W / 28)));
  const tendrils = Array.from({ length: tendrilCount }, (_, i) => ({
    x: ((i + 0.5) / tendrilCount) * W,
    w: (W / tendrilCount) * (1.1 + (i % 3) * 0.25),
    h: H * (0.28 + ((i * 29) % 10) * 0.028),
    speed: 1.8 + ((i * 13) % 6) * 0.28,
    phase: i * 1.45,
    curl: (i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 4),
  }));

  function drawWispyLayer(
    heightMult: number,
    alpha: number,
    colors: string[],
    curlMult: number,
    speedMult: number
  ) {
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
    ctx.shadowColor = colors[1];
    ctx.shadowBlur = 10;

    const baseY = H - 2;
    tendrils.forEach((f) => {
      const flick = 0.72 + 0.28 * Math.sin(t * f.speed * speedMult + f.phase);
      const th = f.h * heightMult * flick;
      const tw = f.w * 0.55;
      const sway = Math.sin(t * f.speed * 0.85 * speedMult + f.phase) * f.curl * curlMult;
      const midCurl = Math.cos(t * f.speed * 1.15 * speedMult + f.phase) * (f.curl * 0.65 * curlMult);
      const tipX = f.x + sway;
      const tipY = Math.max(2, baseY - th);

      const grad = ctx.createLinearGradient(f.x, baseY, tipX, tipY);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.45, colors[1]);
      grad.addColorStop(0.82, colors[2]);
      grad.addColorStop(1, 'rgba(88, 28, 135, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(f.x - tw, baseY + 2);
      ctx.bezierCurveTo(
        f.x - tw * 0.7 + midCurl,
        baseY - th * 0.45,
        tipX - tw * 0.28 - midCurl * 0.5,
        tipY + th * 0.28,
        tipX,
        tipY
      );
      ctx.bezierCurveTo(
        tipX + tw * 0.25 + midCurl * 0.35,
        tipY + th * 0.32,
        f.x + tw * 0.75 + midCurl * 0.6,
        baseY - th * 0.4,
        f.x + tw,
        baseY + 2
      );
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  let animId: number;
  function loop(now: number) {
    if (!canvas || !canvas.isConnected || !ctx) return;
    const elapsed = (now - startTime) / 1000;
    t += 0.028;

    // Phase 1 (0 -> 1.5s): Dramatic translucent purple flame wave enters & flares once
    // Phase 2 (1.5s+): Smoothly eases down to a light, low, continuous idle purple burn!
    let surge = 0;
    if (elapsed < 1.55) {
      surge = Math.sin((elapsed / 1.55) * Math.PI); // 0 -> 1 -> 0 smooth single burst
    }
    const idle = Math.min(1, elapsed / 0.55) * 0.34; // gentle translucent idle flame
    const activeAlpha = Math.min(0.78, idle + surge * 0.52);
    const heightScale = 0.58 + surge * 0.85;

    ctx.clearRect(0, 0, W, H);

    // One-time horizontal spirit-flame sweep wave during entrance burst (0 -> 1.4s)
    if (surge > 0.02) {
      const sweepProg = Math.min(1, elapsed / 1.35);
      const sweepX = -W * 0.2 + sweepProg * (W * 1.4);
      const sweepGrad = ctx.createRadialGradient(sweepX, H * 0.58, 4, sweepX, H * 0.58, W * 0.38);
      sweepGrad.addColorStop(0, `rgba(232, 121, 249, ${0.42 * surge})`);
      sweepGrad.addColorStop(0.45, `rgba(147, 51, 234, ${0.32 * surge})`);
      sweepGrad.addColorStop(0.8, `rgba(76, 29, 149, ${0.16 * surge})`);
      sweepGrad.addColorStop(1, 'rgba(59, 7, 100, 0)');
      ctx.save();
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Layer 1: Deep translucent smoky royal purple outer wisps
    drawWispyLayer(
      heightScale * 1.12,
      activeAlpha * 0.72,
      ['rgba(76, 29, 149, 0.58)', 'rgba(126, 34, 206, 0.48)', 'rgba(168, 85, 247, 0.25)'],
      1.15,
      0.88
    );

    // Layer 2: Luminous orchid-magenta curling spirit flames (light & crisp)
    drawWispyLayer(
      heightScale * 0.78,
      activeAlpha * 0.78,
      ['rgba(147, 51, 234, 0.62)', 'rgba(192, 38, 211, 0.46)', 'rgba(232, 121, 249, 0.22)'],
      0.9,
      1.18
    );

    // Subtle glowing bottom ember edge line
    ctx.save();
    const seam = ctx.createLinearGradient(0, 0, W, 0);
    seam.addColorStop(0, 'rgba(147, 51, 234, 0)');
    seam.addColorStop(0.2, 'rgba(168, 85, 247, 0.55)');
    seam.addColorStop(0.5, 'rgba(232, 121, 249, 0.72)');
    seam.addColorStop(0.8, 'rgba(168, 85, 247, 0.55)');
    seam.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = seam;
    ctx.globalAlpha = 0.45 + surge * 0.45;
    ctx.fillRect(0, H - 2.5, W, 2.5);
    ctx.restore();

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}

export default function RealFireCanvas({
  className = 'w-full h-full block',
  opts = { light: true },
}: {
  className?: string;
  opts?: { light?: boolean };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cleanup = startRealFireCanvas(canvasRef.current, opts);
    return cleanup;
  }, [opts]);

  return <canvas ref={canvasRef} className={className} />;
}
