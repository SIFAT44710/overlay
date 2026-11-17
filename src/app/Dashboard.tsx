'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_COLORS = {
  bgColor: '#18191a',
  barFill: '#ffffff',
  lineStroke: '#ffc600',
  lineLabel: '#000000',
  barLabel: '#000000',
  axisText: '#ffffff',
};

export default function Dashboard() {
  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_dashboard1');
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
        <image
          href={teamData.logo}
          x={-25}
          y={0}
          height="50"
          width="50"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
      </g>
    );
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const value = payload.elims;
    if (value === 0) return null;

    const finalHeight = Math.max(height, 30);
    const bottom = y + height;
    const finalY = bottom - finalHeight;

    return <Rectangle x={x} y={finalY} width={width} height={finalHeight} fill={colors.barFill} radius={[4, 4, 0, 0]} />;
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;
    
    const finalHeight = Math.max(height, 30);
    const bottom = y + height;
    const finalY = bottom - finalHeight;

    return (
      <text
        x={x + width / 2}
        y={finalY + 20}
        fill={colors.barLabel}
        textAnchor="middle"
        fontSize={16}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const CustomLineLabel = (props: any) => {
    const { x, y, value } = props;
    if (!value || value === 0) return null;
    return (
      <text
        x={x}
        y={y - 12}
        fill={colors.lineLabel}
        textAnchor="middle"
        fontSize={14}
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
          <ComposedChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            
            <XAxis
              dataKey="name"
              interval={0}
              tick={<CustomXAxisTick />}
              axisLine={false}
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
              shape={<CustomBar />}
              label={<CustomBarLabel />}
              barSize={55}
              isAnimationActive={true}
              animationDuration={1500}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="damage"
              stroke={colors.lineStroke}
              strokeWidth={3}
              dot={{ r: 5, fill: colors.lineStroke, stroke: '#000000', strokeWidth: 1 }}
              label={<CustomLineLabel />}
              isAnimationActive={true}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
