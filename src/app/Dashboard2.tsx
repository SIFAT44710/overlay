'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_COLORS = {
  bgColor: '#18191a',
  primaryBar: '#000000',
  secondaryBar: '#692fb2',
  barText: '#ffffff',
  axisText: '#000000',
  axisLine: '#000000',
};

export default function Dashboard2() {
  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_dashboard2');
        if (saved) setColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) });
      } catch (e) {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return null;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        elims: parseInt(row.Kill) || 0,
        damage: parseInt(row.Damage) || 0,
      };
    });

  chartData.sort((a: any, b: any) => b.elims - a.elims);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};

    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={-25} y={5} width="50" height="50" fill={colors.primaryBar} />
        <rect x={-23} y={7} width="46" height="46" fill="#000000" />
        <image
          href={teamData.logo}
          x={-20}
          y={10}
          height="40"
          width="40"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
      </g>
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;

    return (
      <text
        x={x + width / 2}
        y={y + 20}
        fill={colors.barText}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="w-full min-h-screen p-8 flex flex-col justify-end bg-transparent">
      <div className="w-full h-[550px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barGap={0} 
          >
            <CartesianGrid vertical={false} horizontal={false} />
            
            <XAxis
              dataKey="name"
              interval={0}
              tick={<CustomXAxisTick />}
              axisLine={{ stroke: colors.axisLine, strokeWidth: 2 }}
              tickLine={false}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              hide={true}
              domain={[0, (dataMax: number) => Math.max(dataMax + 2, 5)]}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              hide={true}
              domain={[0, (dataMax: number) => Math.max(dataMax + 500, 1000)]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#18191a] border border-[#3a3b3c] p-3 rounded-lg shadow-xl text-white">
                      <p className="font-bold text-yellow-400">{d.name}</p>
                      <p className="text-sm">Elims: <span className="font-semibold">{d.elims}</span></p>
                      <p className="text-sm">Damage: <span className="font-semibold">{d.damage}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="elims"
              fill={colors.primaryBar}
              label={<CustomLabel />}
              barSize={28}
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1500}
            />

            <Bar
              yAxisId="right"
              dataKey="damage"
              fill={colors.secondaryBar}
              label={<CustomLabel />}
              barSize={28}
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
