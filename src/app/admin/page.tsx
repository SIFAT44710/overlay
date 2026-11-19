'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Dashboard from '../Dashboard';
import Dashboard2 from '../Dashboard2';
import Dashboard3 from '../Dashboard3';
import Dashboard4 from '../Dashboard4';
import Dashboard5 from '../Dashboard5';
import Dashboard6 from '../Dashboard6';
import Dashboard7 from '../Dashboard7';
import Dashboard8 from '../components/Dashboard8';
import Dashboard9 from '../components/Dashboard9';
import Dashboard10 from '../components/Dashboard10';
import Dashboard11 from '../components/Dashboard11';
import Dashboard12 from '../components/Dashboard12';

interface ColorFieldDef {
  key: string;
  label: string;
  defaultVal: string;
  desc: string;
}

interface SlideConfig {
  id: number;
  name: string;
  title: string;
  desc: string;
  storageKey: string;
  defaults: Record<string, string>;
  fields: ColorFieldDef[];
  presets: { name: string; colors: Record<string, string> }[];
}

const SLIDES: SlideConfig[] = [
  {
    id: 1,
    name: 'Slide 1',
    title: 'Top 12 Elims & Damage Trend',
    desc: 'Bar Chart for Kills + Smooth Curve for Damage with Team Logos',
    storageKey: 'rtb_colors_dashboard1',
    defaults: {
      bgColor: '#18191a',
      barFill: '#ffffff',
      lineStroke: '#ffc600',
      lineLabel: '#000000',
      barLabel: '#000000',
      axisText: '#ffffff',
    },
    fields: [
      { key: 'barFill', label: 'Elims Bar Color', defaultVal: '#ffffff', desc: 'Color of vertical kill bars' },
      { key: 'lineStroke', label: 'Damage Curve Color', defaultVal: '#ffc600', desc: 'Color of damage trend line & dots' },
      { key: 'barLabel', label: 'Bar Value Text', defaultVal: '#000000', desc: 'Number inside kill bars' },
      { key: 'lineLabel', label: 'Line Value Text', defaultVal: '#000000', desc: 'Damage numbers above points' },
      { key: 'axisText', label: 'Team Names & Axis', defaultVal: '#ffffff', desc: 'Team names and axis numbers' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color (Transparent in OBS mode)' },
    ],
    presets: [
      {
        name: 'Classic Gold',
        colors: { bgColor: '#18191a', barFill: '#ffffff', lineStroke: '#ffc600', lineLabel: '#000000', barLabel: '#000000', axisText: '#ffffff' },
      },
      {
        name: 'RTB Esports Blue',
        colors: { bgColor: '#0b0e14', barFill: '#1877f2', lineStroke: '#00e5ff', lineLabel: '#00e5ff', barLabel: '#ffffff', axisText: '#e4e6eb' },
      },
      {
        name: 'Toxic Neon',
        colors: { bgColor: '#101712', barFill: '#00ff88', lineStroke: '#ff007f', lineLabel: '#ff007f', barLabel: '#000000', axisText: '#ffffff' },
      },
    ],
  },
  {
    id: 2,
    name: 'Slide 2',
    title: 'Double Bar Comparison',
    desc: 'Side-by-side Kills & Damage grouped bars with custom team logos',
    storageKey: 'rtb_colors_dashboard2',
    defaults: {
      bgColor: '#18191a',
      primaryBar: '#000000',
      secondaryBar: '#692fb2',
      barText: '#ffffff',
      axisText: '#000000',
      axisLine: '#000000',
    },
    fields: [
      { key: 'primaryBar', label: 'Kills Bar (Primary)', defaultVal: '#000000', desc: 'Main bar color for kills' },
      { key: 'secondaryBar', label: 'Damage Bar (Secondary)', defaultVal: '#692fb2', desc: 'Side bar color for damage' },
      { key: 'barText', label: 'Bar Value Text', defaultVal: '#ffffff', desc: 'Numbers inside bars' },
      { key: 'axisText', label: 'Axis & Team Text', defaultVal: '#000000', desc: 'Team names and axis numbers' },
      { key: 'axisLine', label: 'Grid / Axis Lines', defaultVal: '#000000', desc: 'Subtle grid line accents' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Classic Black & Purple',
        colors: { bgColor: '#18191a', primaryBar: '#000000', secondaryBar: '#692fb2', barText: '#ffffff', axisText: '#000000', axisLine: '#000000' },
      },
      {
        name: 'RTB Blue & Gold',
        colors: { bgColor: '#0b0e14', primaryBar: '#1877f2', secondaryBar: '#ffd700', barText: '#ffffff', axisText: '#ffffff', axisLine: '#ffffff40' },
      },
      {
        name: 'Cyber Cyan & Violet',
        colors: { bgColor: '#0b0e14', primaryBar: '#00e5ff', secondaryBar: '#a855f7', barText: '#000000', axisText: '#e4e6eb', axisLine: '#3a3b3c' },
      },
    ],
  },
  {
    id: 3,
    name: 'Slide 3',
    title: 'Matrix 3-Line Grid',
    desc: 'Multi-metric trend comparing Kill Points, Survival Score & Damage',
    storageKey: 'rtb_colors_dashboard3',
    defaults: {
      bgColor: '#18191a',
      killPoints: '#00ffa3',
      survivalScore: '#ffea00',
      damage: '#ff00a0',
      axisTextLeft: '#ffffff80',
      axisTextRight: '#ff00a0',
    },
    fields: [
      { key: 'killPoints', label: 'Kill Points Line', defaultVal: '#00ffa3', desc: 'Green accent line' },
      { key: 'survivalScore', label: 'Survival Score Line', defaultVal: '#ffea00', desc: 'Yellow accent line' },
      { key: 'damage', label: 'Damage Metric Line', defaultVal: '#ff00a0', desc: 'Pink accent line' },
      { key: 'axisTextLeft', label: 'Left Axis Text', defaultVal: '#ffffff80', desc: 'Left numbers' },
      { key: 'axisTextRight', label: 'Right Axis Text', defaultVal: '#ff00a0', desc: 'Right damage numbers' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Default Tri-Color',
        colors: { bgColor: '#18191a', killPoints: '#00ffa3', survivalScore: '#ffea00', damage: '#ff00a0', axisTextLeft: '#ffffff80', axisTextRight: '#ff00a0' },
      },
      {
        name: 'RGB Laser',
        colors: { bgColor: '#0b0e14', killPoints: '#00ffff', survivalScore: '#ffff00', damage: '#ff0055', axisTextLeft: '#e4e6eb', axisTextRight: '#ff0055' },
      },
    ],
  },
  {
    id: 4,
    name: 'Slide 4',
    title: 'Multi-Team Radar Matrix',
    desc: '5-Axis Radar chart comparing performance metrics of top squads',
    storageKey: 'rtb_colors_dashboard4',
    defaults: {
      bgColor: '#18191a',
      team1: '#1f2937',
      team2: '#692fb2',
      radarTick: '#692fb2',
      radarGrid: '#1f2937',
    },
    fields: [
      { key: 'team1', label: 'Team 1 (Slate)', defaultVal: '#1f2937', desc: 'Team 1 fill/stroke' },
      { key: 'team2', label: 'Team 2 (Purple)', defaultVal: '#692fb2', desc: 'Team 2 fill/stroke' },
      { key: 'radarTick', label: 'Tick Label Accent', defaultVal: '#692fb2', desc: 'Outer metric labels' },
      { key: 'radarGrid', label: 'Grid Polygon Ring', defaultVal: '#1f2937', desc: 'Spiderweb grid lines' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Slate & Royal Purple',
        colors: { bgColor: '#18191a', team1: '#1f2937', team2: '#692fb2', radarTick: '#692fb2', radarGrid: '#1f2937' },
      },
      {
        name: 'Cyber Strike',
        colors: { bgColor: '#0b0e14', team1: '#00e5ff', team2: '#ec4899', radarTick: '#00e5ff', radarGrid: '#374151' },
      },
    ],
  },
  {
    id: 5,
    name: 'Slide 5',
    title: 'Match Breakdown Multi-Line',
    desc: 'Line graph tracking round-by-round points progression for contenders',
    storageKey: 'rtb_colors_dashboard5',
    defaults: {
      bgColor: '#18191a',
      team1: '#000000',
      team2: '#692fb2',
      lineStroke: '#6b7280',
      textColor: '#ffffff',
    },
    fields: [
      { key: 'team1', label: 'Contender 1 Line', defaultVal: '#000000', desc: 'Line & dot for Contender 1' },
      { key: 'team2', label: 'Contender 2 Line', defaultVal: '#692fb2', desc: 'Line & dot for Contender 2' },
      { key: 'lineStroke', label: 'Grid & Axis Lines', defaultVal: '#6b7280', desc: 'Axis border & divider line' },
      { key: 'textColor', label: 'Text & Values', defaultVal: '#ffffff', desc: 'Text font color' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Default Black & Violet',
        colors: { bgColor: '#18191a', team1: '#000000', team2: '#692fb2', lineStroke: '#6b7280', textColor: '#ffffff' },
      },
      {
        name: 'Gold vs Crimson',
        colors: { bgColor: '#0b0e14', team1: '#ffd700', team2: '#ef4444', lineStroke: '#4b5563', textColor: '#f3f4f6' },
      },
    ],
  },
  {
    id: 6,
    name: 'Slide 6',
    title: 'Survival vs Kills Polar Matrix',
    desc: 'Polar area comparing survival time against frag aggression',
    storageKey: 'rtb_colors_dashboard6',
    defaults: {
      bgColor: '#18191a',
      radarFill: '#692fb2',
      badgeBg: '#000000',
      badgeBorder: '#692fb2',
      badgeText: '#ffffff',
      gridStroke: '#333333',
    },
    fields: [
      { key: 'radarFill', label: 'Polar Polygon Fill', defaultVal: '#692fb2', desc: 'Main polygon area color' },
      { key: 'badgeBg', label: 'Score Badge Bg', defaultVal: '#000000', desc: 'Badge background' },
      { key: 'badgeBorder', label: 'Badge Border Accent', defaultVal: '#692fb2', desc: 'Badge 2px border' },
      { key: 'badgeText', label: 'Badge Number Color', defaultVal: '#ffffff', desc: 'Points number' },
      { key: 'gridStroke', label: 'Concentric Ring Lines', defaultVal: '#333333', desc: 'Spiderweb grid stroke' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Dark Violet',
        colors: { bgColor: '#18191a', radarFill: '#692fb2', badgeBg: '#000000', badgeBorder: '#692fb2', badgeText: '#ffffff', gridStroke: '#333333' },
      },
      {
        name: 'Matrix Mint',
        colors: { bgColor: '#0a0f0d', radarFill: '#10b981', badgeBg: '#022c22', badgeBorder: '#34d399', badgeText: '#ffffff', gridStroke: '#064e3b' },
      },
    ],
  },
  {
    id: 7,
    name: 'Slide 7',
    title: 'Head-to-Head Clash Gauge',
    desc: 'Direct head-to-head comparison gauge for tournament rivalries',
    storageKey: 'rtb_colors_dashboard7',
    defaults: {
      bgColor: '#18191a',
      player1Color: '#000000',
      player2Color: '#692fb2',
      borderColor: '#004b87',
      textColor: '#ffffff',
      labelColor: '#ffffff',
    },
    fields: [
      { key: 'player1Color', label: 'Player 1 Accent', defaultVal: '#000000', desc: 'Left contender bar & badge' },
      { key: 'player2Color', label: 'Player 2 Accent', defaultVal: '#692fb2', desc: 'Right contender bar & badge' },
      { key: 'borderColor', label: 'Center Clash Gauge', defaultVal: '#004b87', desc: 'Gauge arc accent' },
      { key: 'textColor', label: 'Numbers & Metrics', defaultVal: '#ffffff', desc: 'Main stats font color' },
      { key: 'labelColor', label: 'Label Headers', defaultVal: '#ffffff', desc: 'ELIMS, DAMAGE headers' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Classic Duel',
        colors: { bgColor: '#18191a', player1Color: '#000000', player2Color: '#692fb2', borderColor: '#004b87', textColor: '#ffffff', labelColor: '#ffffff' },
      },
      {
        name: 'Crimson vs Cyan',
        colors: { bgColor: '#0b0e14', player1Color: '#ef4444', player2Color: '#06b6d4', borderColor: '#f59e0b', textColor: '#ffffff', labelColor: '#f3f4f6' },
      },
    ],
  },
  {
    id: 8,
    name: 'Slide 8',
    title: 'Total Points Column (12 Teams)',
    desc: 'Vertical race bars with count-up numbers and square team badges',
    storageKey: 'rtb_colors_dashboard8',
    defaults: {
      col1: '#F5B700',
      colDark: '#111827',
      colPurple: '#6225A6',
      borderCol: '#000000',
      textNum: '#000000',
    },
    fields: [
      { key: 'col1', label: 'Rank #1 Peak Gold', defaultVal: '#F5B700', desc: 'First place column and badge' },
      { key: 'colDark', label: 'Even Column (Dark)', defaultVal: '#111827', desc: 'Dark alternating column' },
      { key: 'colPurple', label: 'Odd Column (Purple)', defaultVal: '#6225A6', desc: 'Signature purple alternating column' },
      { key: 'borderCol', label: 'Border Stroke', defaultVal: '#000000', desc: 'Hard border for columns' },
      { key: 'textNum', label: 'Number Color', defaultVal: '#000000', desc: 'Value text above columns' },
    ],
    presets: [
      {
        name: 'Demo-Graph-BD Signature',
        colors: { col1: '#F5B700', colDark: '#111827', colPurple: '#6225A6', borderCol: '#000000', textNum: '#000000' },
      },
      {
        name: 'Cyber Cyan & Violet',
        colors: { col1: '#00DF82', colDark: '#0f172a', colPurple: '#7c3aed', borderCol: '#000000', textNum: '#000000' },
      },
    ],
  },
  {
    id: 9,
    name: 'Slide 9',
    title: 'Top 4 Sequential Radar',
    desc: 'Unfolding sequential radar with gold-first animation and pulsing node halos',
    storageKey: 'rtb_colors_dashboard9',
    defaults: {
      team1: '#F5B700',
      team2: '#6225A6',
      team3: '#00DF82',
      team4: '#EC008C',
      axisColor: '#6225A6',
      gridColor: '#000000',
    },
    fields: [
      { key: 'team1', label: 'Team 1 (Gold)', defaultVal: '#F5B700', desc: 'First unfolding polygon' },
      { key: 'team2', label: 'Team 2 (Purple)', defaultVal: '#6225A6', desc: 'Second polygon' },
      { key: 'team3', label: 'Team 3 (Mint)', defaultVal: '#00DF82', desc: 'Third polygon' },
      { key: 'team4', label: 'Team 4 (Hot Pink)', defaultVal: '#EC008C', desc: 'Fourth polygon' },
      { key: 'axisColor', label: 'Axis Labels Color', defaultVal: '#6225A6', desc: 'KILLS, DAMAGE text' },
      { key: 'gridColor', label: 'Grid Lines Color', defaultVal: '#000000', desc: 'Concentric polygons' },
    ],
    presets: [
      {
        name: 'Demo-Graph-BD Palette',
        colors: { team1: '#F5B700', team2: '#6225A6', team3: '#00DF82', team4: '#EC008C', axisColor: '#6225A6', gridColor: '#000000' },
      },
      {
        name: 'Neon Laser',
        colors: { team1: '#00ffff', team2: '#ff007f', team3: '#ffea00', team4: '#00ff88', axisColor: '#00ffff', gridColor: '#000000' },
      },
    ],
  },
  {
    id: 10,
    name: 'Slide 10',
    title: 'Team H2H Slanted Butterfly',
    desc: 'Dark Navy vs Purple slanted nameplates with fire sparks and 6 butterfly comparison bars',
    storageKey: 'rtb_colors_dashboard10',
    defaults: {
      teamABg: '#111827',
      teamBBg: '#6225A6',
      vsBadge: '#F5B700',
      labelColor: '#6225A6',
      accentGold: '#F5B700',
      accentMint: '#00DF82',
    },
    fields: [
      { key: 'teamABg', label: 'Team A Plate (Dark)', defaultVal: '#111827', desc: 'Left slanted nameplate' },
      { key: 'teamBBg', label: 'Team B Plate (Purple)', defaultVal: '#6225A6', desc: 'Right slanted nameplate' },
      { key: 'vsBadge', label: 'VS Center Badge', defaultVal: '#F5B700', desc: 'VS badge and shockwave' },
      { key: 'labelColor', label: 'Metric Labels', defaultVal: '#6225A6', desc: 'TOTAL PTS, KILLS labels' },
      { key: 'accentGold', label: 'Team A Percent Color', defaultVal: '#F5B700', desc: 'Percent text on left' },
      { key: 'accentMint', label: 'Team B Percent Color', defaultVal: '#00DF82', desc: 'Percent text on right' },
    ],
    presets: [
      {
        name: 'Signature BD Clash',
        colors: { teamABg: '#111827', teamBBg: '#6225A6', vsBadge: '#F5B700', labelColor: '#6225A6', accentGold: '#F5B700', accentMint: '#00DF82' },
      },
      {
        name: 'Crimson vs Cyan',
        colors: { teamABg: '#1e1b4b', teamBBg: '#dc2626', vsBadge: '#06b6d4', labelColor: '#06b6d4', accentGold: '#06b6d4', accentMint: '#f59e0b' },
      },
    ],
  },
  {
    id: 11,
    name: 'Slide 11',
    title: '1v1 Clash Semi-Circle Gauge',
    desc: 'Player 1 White plate vs Player 2 Purple plate, semi-circle clash gauge with scanner and 4 slanted ratio bars',
    storageKey: 'rtb_colors_dashboard11',
    defaults: {
      p1Plate: '#ffffff',
      p2Plate: '#6225A6',
      gaugeDark: '#111827',
      gaugePurple: '#6225A6',
      accentGold: '#F5B700',
      labelColor: '#6225A6',
    },
    fields: [
      { key: 'p1Plate', label: 'Player 1 Plate (White)', defaultVal: '#ffffff', desc: 'Left contender plate' },
      { key: 'p2Plate', label: 'Player 2 Plate (Purple)', defaultVal: '#6225A6', desc: 'Right contender plate' },
      { key: 'gaugeDark', label: 'Left Gauge Arc', defaultVal: '#111827', desc: 'Dark arc and left bar share' },
      { key: 'gaugePurple', label: 'Right Gauge Arc', defaultVal: '#6225A6', desc: 'Purple arc and right bar share' },
      { key: 'accentGold', label: 'Sparks & Contact Accent', defaultVal: '#F5B700', desc: 'Contact dot, sparks & ticks' },
      { key: 'labelColor', label: 'Player 1 Tag & Labels', defaultVal: '#6225A6', desc: 'Tag color on player 1' },
    ],
    presets: [
      {
        name: 'Signature 1v1 Clash',
        colors: { p1Plate: '#ffffff', p2Plate: '#6225A6', gaugeDark: '#111827', gaugePurple: '#6225A6', accentGold: '#F5B700', labelColor: '#6225A6' },
      },
      {
        name: 'Gold & Obsidian',
        colors: { p1Plate: '#ffffff', p2Plate: '#d97706', gaugeDark: '#111827', gaugePurple: '#d97706', accentGold: '#f59e0b', labelColor: '#d97706' },
      },
    ],
  },
  {
    id: 12,
    name: 'Slide 12',
    title: 'Weapons Meta Concentric Rings',
    desc: 'Concentric circular progress rings for weapons with weapon stat cards and damage breakdown',
    storageKey: 'rtb_colors_dashboard12',
    defaults: {
      w1Color: '#6225A6',
      w2Color: '#EC008C',
      w3Color: '#F5B700',
      w4Color: '#00DF82',
      w5Color: '#111827',
    },
    fields: [
      { key: 'w1Color', label: 'EVO3 Weapon Accent', defaultVal: '#6225A6', desc: 'First weapon progress ring & badge' },
      { key: 'w2Color', label: 'M7 Weapon Accent', defaultVal: '#EC008C', desc: 'Second weapon progress ring & badge' },
      { key: 'w3Color', label: 'AWM Weapon Accent', defaultVal: '#F5B700', desc: 'Third weapon progress ring & badge' },
      { key: 'w4Color', label: 'UZI Weapon Accent', defaultVal: '#00DF82', desc: 'Fourth weapon progress ring & badge' },
      { key: 'w5Color', label: 'Woodpecker Weapon Accent', defaultVal: '#111827', desc: 'Fifth weapon progress ring & badge' },
    ],
    presets: [
      {
        name: 'Default Meta Weapons',
        colors: { w1Color: '#6225A6', w2Color: '#EC008C', w3Color: '#F5B700', w4Color: '#00DF82', w5Color: '#111827' },
      },
      {
        name: 'Cyberpunk Neon',
        colors: { w1Color: '#00ffff', w2Color: '#ff007f', w3Color: '#ffff00', w4Color: '#39ff14', w5Color: '#1e1b4b' },
      },
    ],
  },
];

interface PreviewStageProps {
  activeSlideId: number;
  currentColors: Record<string, string>;
  bgMode: 'dark' | 'transparent' | 'stream';
}

function BroadcastPreviewStage({ activeSlideId, currentColors, bgMode }: PreviewStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / 1920);
        }
      }
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  let bgStyle: React.CSSProperties = {};
  if (bgMode === 'transparent') {
    bgStyle = {
      backgroundImage: `repeating-conic-gradient(#262626 0% 25%, #181818 0% 50%)`,
      backgroundSize: '20px 20px',
    };
  } else if (bgMode === 'stream') {
    bgStyle = {
      backgroundImage: `radial-gradient(circle at center, #1e1b4b 0%, #090a12 100%)`,
    };
  } else {
    bgStyle = {
      backgroundColor: currentColors.bgColor || '#18191a',
    };
  }

  return (
    <div
      ref={containerRef}
      style={bgStyle}
      className="w-full aspect-video rounded-xl overflow-hidden border border-[#3a3b3c] relative shadow-2xl transition-colors duration-150 select-none flex items-start justify-start"
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
        className="pointer-events-none select-none origin-top-left shrink-0"
      >
        {activeSlideId === 1 && <Dashboard overrideColors={currentColors} />}
        {activeSlideId === 2 && <Dashboard2 overrideColors={currentColors} />}
        {activeSlideId === 3 && <Dashboard3 overrideColors={currentColors} />}
        {activeSlideId === 4 && <Dashboard4 overrideColors={currentColors} />}
        {activeSlideId === 5 && <Dashboard5 overrideColors={currentColors} />}
        {activeSlideId === 6 && <Dashboard6 overrideColors={currentColors} />}
        {activeSlideId === 7 && <Dashboard7 overrideColors={currentColors} />}
        {activeSlideId === 8 && <Dashboard8 overrideColors={currentColors} />}
        {activeSlideId === 9 && <Dashboard9 overrideColors={currentColors} />}
        {activeSlideId === 10 && <Dashboard10 overrideColors={currentColors} />}
        {activeSlideId === 11 && <Dashboard11 overrideColors={currentColors} />}
        {activeSlideId === 12 && <Dashboard12 overrideColors={currentColors} />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [currentColors, setCurrentColors] = useState<Record<string, string>>({});
  const [bgMode, setBgMode] = useState<'dark' | 'transparent' | 'stream'>('dark');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavedSync, setIsSavedSync] = useState(true);

  const activeSlide = SLIDES[activeSlideIndex] || SLIDES[0];

  // Load colors when active slide changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(activeSlide.storageKey);
      if (saved) {
        setCurrentColors({ ...activeSlide.defaults, ...JSON.parse(saved) });
      } else {
        setCurrentColors(activeSlide.defaults);
      }
    } catch {
      setCurrentColors(activeSlide.defaults);
    }
  }, [activeSlide]);

  const handleColorChange = (key: string, value: string) => {
    const updated = { ...currentColors, [key]: value };
    setCurrentColors(updated);
    setIsSavedSync(false);

    try {
      localStorage.setItem(activeSlide.storageKey, JSON.stringify(updated));
    } catch {}

    // Broadcast change across tabs
    window.dispatchEvent(new Event('storage'));

    // POST to /api/theme for cross-machine broadcast
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideKey: `dashboard${activeSlide.id}`,
        colors: updated,
      }),
    })
      .then(() => setIsSavedSync(true))
      .catch(() => setIsSavedSync(true));
  };

  const applyPreset = (presetColors: Record<string, string>) => {
    const updated = { ...currentColors, ...presetColors };
    setCurrentColors(updated);
    setIsSavedSync(false);

    try {
      localStorage.setItem(activeSlide.storageKey, JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event('storage'));

    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideKey: `dashboard${activeSlide.id}`,
        colors: updated,
      }),
    })
      .then(() => setIsSavedSync(true))
      .catch(() => setIsSavedSync(true));
  };

  const resetToDefault = () => {
    applyPreset(activeSlide.defaults);
  };

  const copyObsUrl = (id: number) => {
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(`obs-${id}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#242526] border border-[#3a3b3c] shadow-lg">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                Live Broadcast Color Palette Studio
              </h1>
            </div>
            <p className="text-xs text-[#b0b3b8] mt-1">
              Real-time color controller with instant sync to OBS / vMix browser overlays (Slides 1 – 12)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border transition ${
                isSavedSync
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800 animate-pulse'
              }`}
            >
              {isSavedSync ? '● Synced Live' : '○ Syncing...'}
            </span>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white transition"
            >
              ← Overlays Directory
            </Link>
          </div>
        </div>

        {/* Slide Selection Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-[#1877f2] border-[#1877f2] text-white shadow-lg'
                    : 'bg-[#242526] border-[#3a3b3c] text-[#b0b3b8] hover:text-white hover:border-[#4e4f50]'
                }`}
              >
                {slide.name}
              </button>
            );
          })}
        </div>

        {/* Main Workspace Grid (7 Cols Editor, 5 Cols Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Color Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-[#242526] border border-[#3a3b3c] shadow-lg space-y-6">
              {/* Slide Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#3a3b3c]">
                <div>
                  <h2 className="text-lg font-black text-white">{activeSlide.title}</h2>
                  <p className="text-xs text-[#b0b3b8] mt-0.5">{activeSlide.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white transition self-start sm:self-auto"
                >
                  ↺ Reset Slide
                </button>
              </div>

              {/* Quick Presets */}
              {activeSlide.presets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b0b3b8]">
                    Esports Color Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeSlide.presets.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p.colors)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#18191a] hover:bg-[#2f3031] border border-[#3a3b3c] text-xs font-bold text-white transition hover:border-[#1877f2]"
                      >
                        ⚡ {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Fields */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b0b3b8]">
                  Custom Element Colors:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeSlide.fields.map((f) => {
                    const currentVal = currentColors[f.key] || f.defaultVal;
                    return (
                      <div
                        key={f.key}
                        className="p-3.5 rounded-xl bg-[#18191a] border border-[#3a3b3c] flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{f.label}</div>
                          <div className="text-[10px] text-[#b0b3b8] mt-0.5">{f.desc}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Color Swatch / Native Picker */}
                          <input
                            type="color"
                            value={currentVal.startsWith('#') && currentVal.length === 7 ? currentVal : '#ffffff'}
                            onChange={(e) => handleColorChange(f.key, e.target.value)}
                            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          />

                          {/* Hex Input */}
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) => handleColorChange(f.key, e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#242526] border border-[#3a3b3c] text-xs font-mono text-white focus:outline-none focus:border-[#1877f2]"
                          />

                          {/* Reset Field */}
                          <button
                            type="button"
                            onClick={() => handleColorChange(f.key, f.defaultVal)}
                            className="w-8 h-8 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white flex items-center justify-center text-xs font-bold transition"
                            title="Reset to default"
                          >
                            ↺
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Broadcast Preview Frame (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6 p-5 rounded-2xl bg-[#242526] border border-[#3a3b3c] shadow-xl flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#3a3b3c]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Live Overlay Preview ({activeSlide.name})
                  </span>
                </div>

                {/* Preview Backdrop Modes */}
                <div className="flex items-center gap-1 bg-[#18191a] p-1 rounded-xl border border-[#3a3b3c] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBgMode('dark')}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition ${
                      bgMode === 'dark' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('transparent')}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition ${
                      bgMode === 'transparent' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                    }`}
                  >
                    OBS Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('stream')}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition ${
                      bgMode === 'stream' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                    }`}
                  >
                    Stage
                  </button>
                </div>
              </div>

              {/* Direct Scaled 1920x1080 Real-Time Canvas Stage */}
              <BroadcastPreviewStage
                activeSlideId={activeSlide.id}
                currentColors={currentColors}
                bgMode={bgMode}
              />

              <div className="mt-4 pt-4 border-t border-[#3a3b3c] space-y-3">
                <div className="p-3 rounded-xl bg-[#18191a] border border-[#3a3b3c] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>vMix / OBS Browser Input:</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Real-Time Synced</span>
                  </div>
                  <p className="text-[11px] text-[#b0b3b8] leading-relaxed">
                    Add <code className="text-yellow-400 font-mono">/{activeSlide.id}</code> in OBS/vMix Browser Source (1920x1080). Any color changed here updates instantly without lag!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${activeSlide.id}`}
                    target="_blank"
                    className="flex-1 py-2.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-black uppercase tracking-wider text-center transition shadow"
                  >
                    Open Clean OBS Window ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyObsUrl(activeSlide.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-xs font-bold transition"
                  >
                    {copiedKey === `obs-${activeSlide.id}` ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
