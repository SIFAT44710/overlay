'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_COLORS = {
  bgColor: '#18191a',
  killPoints: '#00ffa3',
  survivalScore: '#ffea00',
  damage: '#ff00a0',
  axisTextLeft: '#ffffff80',
  axisTextRight: '#ff00a0',
};

export default function Dashboard3({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_COLORS);

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_COLORS, ...overrideColors });
      return;
    }
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_dashboard3');
        if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
      } catch (e) {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [overrideColors]);

  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-2xl font-black tracking-widest uppercase">Loading Overlay Data...</span>
        </div>
      </div>
    );
  }
  if (error) return <div className="flex h-screen items-center justify-center text-red-500 font-bold text-xl">Error loading data.</div>;

  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        kills: parseInt(row.Kill) || 0, 
        survival: parseInt(row['Survival Score']) || 0,
        damage: parseInt(row.Damage) || 0,
        total: parseInt(row.Total) || 0,
      };
    });

  chartData.sort((a: any, b: any) => b.total - a.total);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};
    
    return (
      <g transform={`translate(${x},${y})`}>
        <image 
          href={teamData.logo} 
          x={-20} 
          y={10} 
          height="40" 
          width="40" 
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#111111ee] backdrop-blur-md p-4 border border-[#444] rounded-xl shadow-2xl">
          <div className="flex items-center space-x-3 mb-3 border-b border-[#333] pb-2">
            <img src={d.logo} alt="logo" className="w-8 h-8 rounded-full" />
            <span className="text-white font-bold text-lg">{d.name}</span>
          </div>
          <p className="font-semibold flex justify-between" style={{ color: colors.killPoints }}>
            <span>Kill Points:</span> <span className="ml-4">{d.kills}</span>
          </p>
          <p className="font-semibold flex justify-between" style={{ color: colors.survivalScore }}>
            <span>Survival Score:</span> <span className="ml-4">{d.survival}</span>
          </p>
          <p className="font-semibold flex justify-between border-t border-[#333] mt-2 pt-2" style={{ color: colors.damage }}>
            <span>Damage:</span> <span className="ml-4">{d.damage}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value: string, entry: any) => {
    const { color } = entry;
    return <span style={{ color, fontWeight: 'bold', marginRight: '20px', fontSize: '16px' }}>{value}</span>;
  };

  const BlinkingDot = (props: any) => {
    const { cx, cy, fill } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;
    
    return (
      <g transform={`translate(${cx},${cy})`}>
        <circle className="animate-ping" cx={0} cy={0} r={8} fill={fill} opacity={0.5} />
        <circle className="animate-pulse" cx={0} cy={0} r={5} fill={fill} stroke="#111" strokeWidth={2} />
      </g>
    );
  };

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black text-white tracking-wider uppercase mb-2">
          Performance Overview
        </h1>
        <p className="text-gray-400 text-lg font-medium tracking-wide">Kill Points vs Survival Score vs Damage</p>
      </div>
      
      <div className="w-full max-w-7xl h-[600px] z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid stroke="#ffffff15" vertical={false} />
            
            <YAxis 
              yAxisId="left" 
              axisLine={false}
              tickLine={false}
              tick={{fill: colors.axisTextLeft, fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'KILL', angle: -90, position: 'insideLeft', fill: colors.axisTextLeft, fontWeight: 'bold', offset: -10 }}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{fill: colors.axisTextRight, fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'DAMAGE', angle: 90, position: 'insideRight', fill: colors.axisTextRight, fontWeight: 'bold', offset: -10 }}
            />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: '#ffffff30', strokeWidth: 2 }}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{ stroke: '#ffffff30', strokeWidth: 2, strokeDasharray: '5 5' }} 
              content={<CustomTooltip />} 
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              formatter={renderLegendText}
              wrapperStyle={{ paddingTop: '40px' }}
            />

            <Line 
              yAxisId="left"
              type="monotone" 
              name="Kill Points"
              dataKey="kills" 
              stroke={colors.killPoints} 
              strokeWidth={3} 
              dot={<BlinkingDot fill={colors.killPoints} />} 
              activeDot={{ r: 8, fill: '#fff', stroke: colors.killPoints, strokeWidth: 2 }} 
              isAnimationActive={true}
              animationDuration={3000}
            />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              name="Survival Score"
              dataKey="survival" 
              stroke={colors.survivalScore} 
              strokeWidth={3} 
              dot={{ r: 5, fill: colors.survivalScore, stroke: '#111', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#fff', stroke: colors.survivalScore, strokeWidth: 2 }} 
              isAnimationActive={true}
              animationDuration={3000}
            />
            
            <Line 
              yAxisId="right"
              type="monotone" 
              name="Damage"
              dataKey="damage" 
              stroke={colors.damage} 
              strokeWidth={3} 
              dot={{ r: 5, fill: colors.damage, stroke: '#111', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#fff', stroke: colors.damage, strokeWidth: 2 }} 
              isAnimationActive={true}
              animationDuration={3000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
