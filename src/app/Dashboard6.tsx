'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_COLORS = {
  radarFill: '#692fb2',
  badgeBg: '#000000',
  badgeBorder: '#692fb2',
  badgeText: '#ffffff',
  gridStroke: '#333333',
};

export default function MVPStats({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);

  const { data: themeData } = useSWR('/api/theme', fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    if (themeData?.themes?.dashboard6) {
      setColors({ ...DEFAULT_COLORS, ...themeData.themes.dashboard6 });
      return;
    }
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_dashboard6');
        if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
      } catch (e) {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [overrideColors, themeData]);

  const { data, error, isLoading } = useSWR('/api/sheet6', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-2xl font-black tracking-widest uppercase">Loading MVP Data...</span>
        </div>
      </div>
    );
  }
  if (error || !data?.mvpData) return <div className="flex h-screen items-center justify-center text-red-500 font-bold text-xl">Error loading data.</div>;

  const mvpData = data.mvpData;

  const elimsRaw = parseInt(mvpData[3]) || 0;
  const damageRaw = parseInt(mvpData[4]) || 0;
  const assistRaw = parseInt(mvpData[5]) || 0;
  const knockoutRaw = parseInt(mvpData[13]) || 0;
  const survTimeRawStr = mvpData[15] || '0';
  
  let survTimeNormValue = 0;
  if (survTimeRawStr.includes(':')) {
    const parts = survTimeRawStr.split(':');
    survTimeNormValue = parseInt(parts[0]) * 60 + parseInt(parts[1]); 
  } else {
    survTimeNormValue = parseFloat(survTimeRawStr) || 0;
  }

  // Adjust max values based on expected ranges for Group Stage
  const maxElims = 30;
  const maxAssist = 20;
  const maxKnockout = 30;
  const maxDamage = 10000;
  const maxSurvTime = 2500; // e.g. 2500 mins total

  const getNorm = (val: number, max: number) => {
    const norm = (val / max) * 100;
    return norm > 100 ? 100 : norm < 10 ? 20 : norm; // Ensure it looks good visually
  };

  const radarData = [
    { subject: 'ELIMS', valNorm: getNorm(elimsRaw, maxElims), valRaw: elimsRaw },
    { subject: 'ASSIST', valNorm: getNorm(assistRaw, maxAssist), valRaw: assistRaw },
    { subject: 'SURV. TIME', valNorm: getNorm(survTimeNormValue, maxSurvTime), valRaw: survTimeRawStr },
    { subject: 'KNOCKOUT', valNorm: getNorm(knockoutRaw, maxKnockout), valRaw: knockoutRaw },
    { subject: 'DAMAGE', valNorm: getNorm(damageRaw, maxDamage), valRaw: damageRaw },
  ];

  const CustomRadarTick = (props: any) => {
    const { payload, x, y, cx, cy } = props;
    const stat = radarData.find(d => d.subject === payload.value);
    
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Push the tick outward
    const push = 65; 
    const nx = x + (dx / len) * push;
    const ny = y + (dy / len) * push;

    return (
      <g transform={`translate(${nx}, ${ny})`}>
        {/* Background pill/box */}
        <rect 
          x={-55} 
          y={-30} 
          width={110} 
          height={60} 
          rx={8} 
          fill={colors.badgeBg} 
          filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.3))"
          stroke={colors.badgeBorder}
          strokeWidth="2"
        />
        {/* Value Text */}
        <text x={0} y={0} textAnchor="middle" fill={colors.badgeText} fontSize={26} fontWeight="900">
          {stat?.valRaw}
        </text>
        {/* Label Text */}
        <text x={0} y={18} textAnchor="middle" fill={colors.badgeBorder} fontSize={11} fontWeight="800" className="tracking-widest">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full min-h-screen p-8 flex items-center justify-center bg-transparent overflow-hidden">
      <div className="w-[800px] h-[700px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="75%" 
            data={radarData}
            margin={{ top: 100, right: 100, bottom: 100, left: 100 }}
          >
            <PolarGrid 
              gridType="polygon" 
              stroke={colors.gridStroke} 
              strokeWidth={1}
            />
            
            <PolarAngleAxis 
              dataKey="subject" 
              tick={<CustomRadarTick />}
            />
            
            <Radar
              name="MVP"
              dataKey="valNorm"
              stroke={colors.radarFill} 
              strokeWidth={2}
              fill={colors.radarFill} 
              fillOpacity={0.6}
              isAnimationActive={true}
              animationDuration={3000}
              dot={{ r: 6, fill: colors.radarFill, stroke: '#000000', strokeWidth: 2 }} 
              className="animate-pulse"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
