'use client';

import React, { useEffect, useRef } from 'react';

interface SpiritFireCanvasProps {
  className?: string;
}

export default function SpiritFireCanvas({ className }: SpiritFireCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth || 320;
      canvas.height = canvas.clientHeight || 90;
    };
    resize();

    const loop = () => {
      const W = canvas.width;
      const H = canvas.height;
      t += 0.045;
      ctx.clearRect(0, 0, W, H);

      const g = ctx.createLinearGradient(0, H, 0, 0);
      g.addColorStop(0, 'rgba(147, 51, 234, 0.52)');
      g.addColorStop(0.55, 'rgba(192, 38, 211, 0.28)');
      g.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 14) {
        const y =
          H * 0.42 +
          Math.sin(x * 0.04 + t * 3) * 14 +
          Math.cos(x * 0.09 - t * 4) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute -inset-x-2 -top-8 bottom-0 -z-10 overflow-visible ${className || ''}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
