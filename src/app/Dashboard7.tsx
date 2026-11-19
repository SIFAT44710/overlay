'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_COLORS = {
  player1Color: '#000000',
  player2Color: '#692fb2',
  borderColor: '#004b87',
  textColor: '#ffffff',
  labelColor: '#ffffff',
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 3000;

    const tick = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      setCount(Math.floor(value * easeOut));

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setCount(value);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{count}</>;
};

const StatBar = ({ 
  label, 
  val1, 
  val2, 
  colors 
}: { 
  label: string; 
  val1: number; 
  val2: number; 
  colors: typeof DEFAULT_COLORS;
}) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = val1 + val2 || 1; // avoid division by zero
  const p1Width = (val1 / total) * 100;
  const p2Width = (val2 / total) * 100;

  return (
    <div className="flex flex-col items-center w-full my-6 relative">
      {/* Label */}
      <span 
        className="font-black text-sm uppercase tracking-widest mb-1" 
        style={{ color: colors.labelColor }}
      >
        {label}
      </span>
      {/* Bar Container */}
      <div 
        className="w-full flex h-14 bg-gray-900 border-2 shadow-2xl relative overflow-hidden"
        style={{
          borderColor: colors.borderColor,
          clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)'
        }}
      >
        {/* Left Bar */}
        <div 
          className="h-full flex items-center px-4 transition-all duration-[3000ms] ease-out"
          style={{ 
            width: animated ? `${p1Width}%` : '50%',
            backgroundColor: colors.player1Color
          }}
        >
          <span className="font-black text-3xl" style={{ color: colors.textColor }}>
            <AnimatedNumber value={val1} />
          </span>
        </div>

        {/* Right Bar */}
        <div 
          className="h-full flex items-center justify-end px-4 transition-all duration-[3000ms] ease-out"
          style={{ 
            width: animated ? `${p2Width}%` : '50%',
            backgroundColor: colors.player2Color
          }}
        >
          <span className="font-black text-3xl" style={{ color: colors.textColor }}>
            <AnimatedNumber value={val2} />
          </span>
        </div>
        
        {/* Center Divider Slant */}
        <div 
          className="absolute h-full w-2 bg-[#00000030] top-0 transition-all duration-[3000ms] ease-out"
          style={{ 
            left: animated ? `${p1Width}%` : '50%',
            transform: 'translateX(-50%) skewX(-15deg)'
          }}
        />
      </div>
    </div>
  );
};

export default function HeadToHead({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);

  const { data: themeData } = useSWR('/api/theme', fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard7) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard7 });
      return;
    }
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_dashboard7');
        if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
      } catch (e) {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [overrideColors, themeData]);

  const { data, error, isLoading } = useSWR('/api/sheet7', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-2xl font-black tracking-widest uppercase">Loading 1v1 Data...</span>
        </div>
      </div>
    );
  }
  if (error || !data?.player1 || !data?.player2) return <div className="flex h-screen items-center justify-center text-red-500 font-bold text-xl">Error loading data.</div>;

  const p1 = data.player1;
  const p2 = data.player2;

  const stats = [
    { label: 'ELIMS', val1: parseFloat(p1[3]) || 0, val2: parseFloat(p2[3]) || 0 },
    { label: 'DAMAGE', val1: parseFloat(p1[4]) || 0, val2: parseFloat(p2[4]) || 0 },
    { label: 'ASSISTS', val1: parseFloat(p1[5]) || 0, val2: parseFloat(p2[5]) || 0 },
    { label: 'HEADSHOT', val1: parseFloat(p1[8]) || 0, val2: parseFloat(p2[8]) || 0 },
  ];

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-transparent overflow-hidden">
      
      {/* Players Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
        <div 
          className="text-4xl font-black px-6 py-2 rounded shadow-xl uppercase border-4 border-black"
          style={{ 
            backgroundColor: colors.player1Color === '#000000' ? '#ffffff' : colors.player1Color,
            color: colors.player1Color === '#000000' ? '#000000' : '#ffffff'
          }}
        >
          {p1[2]}
        </div>
        <div className="text-3xl font-black text-white italic">VS</div>
        <div 
          className="text-4xl font-black px-6 py-2 rounded shadow-xl uppercase border-4 border-black"
          style={{ 
            backgroundColor: colors.player2Color,
            color: colors.textColor
          }}
        >
          {p2[2]}
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center z-10 px-8 py-6 rounded-xl bg-gradient-to-b from-[#00000000] to-[#00000000]">
        {stats.map((s, i) => (
          <StatBar key={i} label={s.label} val1={s.val1} val2={s.val2} colors={colors} />
        ))}
      </div>
    </div>
  );
}
