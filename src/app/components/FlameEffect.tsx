'use client';

import React, { useEffect, useRef } from 'react';

interface FlameEffectProps {
  color?: string; // Hex color from admin panel, e.g. '#6225A6', '#F5B700', '#E11D48'
  height?: number | string;
  opacity?: number;
  className?: string;
  showCore?: boolean;
}

// Convert Hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [139, 92, 246]; // Default purple
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Calculate Hue Rotation Angle relative to default purple (approx 270°)
function getHueRotation(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max === min) h = 0;
  else if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  // Default video flame is purple around 275deg
  const delta = (h - 275 + 360) % 360;
  return delta;
}

export default function FlameEffect({
  color = '#8B5CF6',
  height = 96,
  opacity = 0.85,
  className = '',
}: FlameEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const [tr, tg, tb] = hexToRgb(color);
    const hueAngle = getHueRotation(tr, tg, tb);

    // Apply CSS filter for instant GPU tinting matching the admin color
    canvas.style.filter = `hue-rotate(${hueAngle}deg) saturate(1.4) drop-shadow(0 0 14px rgba(${tr},${tg},${tb},0.45))`;

    let animId: number;
    let videoLoaded = false;

    // 1. Setup hidden video element for flame sampling
    const video = document.createElement('video');
    video.src = '/flame.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    video.addEventListener('canplay', () => {
      videoLoaded = true;
      video.play().catch(() => {});
    });
    video.play().catch(() => {});

    // 2. Procedural flame particles fallback (runs seamlessly if video is buffering)
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * 800,
      y: 120 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(2.2 + Math.random() * 2.8),
      size: 14 + Math.random() * 22,
      life: Math.random() * 60,
      maxLife: 50 + Math.random() * 40,
    }));

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (videoLoaded && video.readyState >= 2 && !video.paused) {
        // Render video frame and strip black background (luminance to alpha)
        // so it blends cleanly with transparent and white backgrounds!
        ctx.drawImage(video, 0, 0, w, h);
        try {
          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;
          const len = d.length;

          for (let i = 0; i < len; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            // Black pixels have low luminance, flames have high luminance
            const lum = Math.max(r, g, b);

            if (lum < 24) {
              d[i + 3] = 0; // Completely transparent black
            } else {
              // Smooth alpha curve for soft organic flame edges
              const alphaNorm = (lum - 24) / (255 - 24);
              d[i + 3] = Math.min(255, Math.round(alphaNorm * 255 * opacity));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Fallback if cross-origin or canvas read error
        }
      } else {
        // Procedural organic flame animation fallback
        particles.forEach((p) => {
          p.x += p.vx + Math.sin(p.y * 0.05) * 0.8;
          p.y += p.vy;
          p.life += 1;

          if (p.life >= p.maxLife || p.y < -30) {
            p.x = Math.random() * w;
            p.y = h + Math.random() * 10;
            p.life = 0;
            p.vy = -(2.2 + Math.random() * 2.8);
          }

          const frac = 1 - p.life / p.maxLife;
          const rad = p.size * frac;
          if (rad <= 0) return;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
          grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * frac * opacity})`);
          grad.addColorStop(0.35, `rgba(${tr}, ${tg}, ${tb}, ${0.75 * frac * opacity})`);
          grad.addColorStop(0.75, `rgba(${tr}, ${tg}, ${tb}, ${0.35 * frac * opacity})`);
          grad.addColorStop(1, `rgba(${tr}, ${tg}, ${tb}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [color, opacity]);

  return (
    <div
      className={`pointer-events-none relative overflow-hidden select-none ${className}`}
      style={{ height, opacity }}
    >
      <canvas
        ref={canvasRef}
        width={700}
        height={130}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
