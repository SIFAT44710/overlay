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
import Dashboard13 from '../components/Dashboard13';

interface ColorFieldDef {
  key: string;
  label: string;
  defaultVal: string;
  desc: string;
}

interface PresetDef {
  name: string;
  desc?: string;
  colors: Record<string, string>;
}

interface SlideConfig {
  id: number;
  name: string;
  title: string;
  desc: string;
  storageKey: string;
  defaults: Record<string, string>;
  fields: ColorFieldDef[];
  presets: PresetDef[];
}

interface MasterPalette {
  id: string;
  name: string;
  tag: string;
  swatches: string[];
  slideThemes: Record<number, Record<string, string>>;
}

// 8 Professional Tournament Master Color Palettes (গ্লোবাল কালার প্লেটসমূহ)
const MASTER_PALETTES: MasterPalette[] = [
  {
    id: 'demo_bd',
    name: 'Demo-Graph BD Signature',
    tag: 'Classic Esports',
    swatches: ['#111827', '#6225A6', '#F5B700', '#00DF82', '#EC008C'],
    slideThemes: {
      1: { bgColor: '#18191a', barFill: '#ffffff', lineStroke: '#ffc600', lineLabel: '#000000', barLabel: '#000000', axisText: '#ffffff' },
      2: { bgColor: '#18191a', primaryBar: '#000000', secondaryBar: '#692fb2', barText: '#ffffff', axisText: '#000000', axisLine: '#000000' },
      3: { bgColor: '#18191a', killPoints: '#00ffa3', survivalScore: '#ffea00', damage: '#ff00a0', axisTextLeft: '#ffffff80', axisTextRight: '#ff00a0' },
      4: { bgColor: '#18191a', team1: '#1f2937', team2: '#692fb2', radarTick: '#692fb2', radarGrid: '#1f2937' },
      5: { bgColor: '#18191a', team1: '#000000', team2: '#692fb2', lineStroke: '#6b7280', textColor: '#ffffff' },
      6: { bgColor: '#18191a', radarFill: '#692fb2', badgeBg: '#000000', badgeBorder: '#692fb2', badgeText: '#ffffff', gridStroke: '#333333' },
      7: { bgColor: '#18191a', player1Color: '#000000', player2Color: '#692fb2', borderColor: '#004b87', textColor: '#ffffff', labelColor: '#ffffff' },
      8: { col1: '#F5B700', colDark: '#111827', colPurple: '#6225A6', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#F5B700', team2: '#6225A6', team3: '#00DF82', team4: '#EC008C', axisColor: '#6225A6', gridColor: '#000000' },
      10: { teamABg: '#111827', teamBBg: '#6225A6', vsBadge: '#F5B700', labelColor: '#6225A6', accentGold: '#F5B700', accentMint: '#00DF82' },
      11: { p1Plate: '#ffffff', p2Plate: '#6225A6', gaugeDark: '#111827', gaugePurple: '#6225A6', accentGold: '#F5B700', labelColor: '#6225A6' },
      12: { w1Color: '#6225A6', w2Color: '#EC008C', w3Color: '#F5B700', w4Color: '#00DF82', w5Color: '#111827' },
      13: { headerGold: '#F5B700', headerPurple: '#6225A6', headerDark: '#2E0E56', totalPtsGold: '#F5B700', accentMint: '#00DF82', accentCrimson: '#FF3B5C' },
    },
  },
  {
    id: 'ffws_official',
    name: 'FFWS World Series',
    tag: 'Official Championship',
    swatches: ['#0B0F19', '#E11D48', '#F59E0B', '#06B6D4', '#7C3AED'],
    slideThemes: {
      1: { bgColor: '#0b0f19', barFill: '#e11d48', lineStroke: '#f59e0b', lineLabel: '#ffffff', barLabel: '#ffffff', axisText: '#06b6d4' },
      2: { bgColor: '#0b0f19', primaryBar: '#e11d48', secondaryBar: '#06b6d4', barText: '#ffffff', axisText: '#ffffff', axisLine: '#f59e0b' },
      3: { bgColor: '#0b0f19', killPoints: '#e11d48', survivalScore: '#f59e0b', damage: '#06b6d4', axisTextLeft: '#ffffff', axisTextRight: '#f59e0b' },
      4: { bgColor: '#0b0f19', team1: '#e11d48', team2: '#06b6d4', radarTick: '#f59e0b', radarGrid: '#1e293b' },
      5: { bgColor: '#0b0f19', team1: '#e11d48', team2: '#06b6d4', lineStroke: '#475569', textColor: '#ffffff' },
      6: { bgColor: '#0b0f19', radarFill: '#e11d48', badgeBg: '#0f172a', badgeBorder: '#f59e0b', badgeText: '#ffffff', gridStroke: '#334155' },
      7: { bgColor: '#0b0f19', player1Color: '#e11d48', player2Color: '#06b6d4', borderColor: '#f59e0b', textColor: '#ffffff', labelColor: '#ffffff' },
      8: { col1: '#F59E0B', colDark: '#0B0F19', colPurple: '#E11D48', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#F59E0B', team2: '#E11D48', team3: '#06B6D4', team4: '#7C3AED', axisColor: '#06B6D4', gridColor: '#000000' },
      10: { teamABg: '#0B0F19', teamBBg: '#E11D48', vsBadge: '#F59E0B', labelColor: '#06B6D4', accentGold: '#F59E0B', accentMint: '#06B6D4' },
      11: { p1Plate: '#ffffff', p2Plate: '#E11D48', gaugeDark: '#0B0F19', gaugePurple: '#E11D48', accentGold: '#F59E0B', labelColor: '#E11D48' },
      12: { w1Color: '#F59E0B', w2Color: '#E11D48', w3Color: '#06B6D4', w4Color: '#7C3AED', w5Color: '#0B0F19' },
      13: { headerGold: '#F59E0B', headerPurple: '#E11D48', headerDark: '#0B0F19', totalPtsGold: '#F59E0B', accentMint: '#06B6D4', accentCrimson: '#E11D48' },
    },
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neo-Tokyo',
    tag: 'Ultra High Contrast',
    swatches: ['#0D0221', '#00F0FF', '#FF007F', '#FFE600', '#7122FA'],
    slideThemes: {
      1: { bgColor: '#0d0221', barFill: '#00f0ff', lineStroke: '#ff007f', lineLabel: '#ffe600', barLabel: '#000000', axisText: '#ffffff' },
      2: { bgColor: '#0d0221', primaryBar: '#00f0ff', secondaryBar: '#ff007f', barText: '#000000', axisText: '#ffffff', axisLine: '#ffe600' },
      3: { bgColor: '#0d0221', killPoints: '#00f0ff', survivalScore: '#ffe600', damage: '#ff007f', axisTextLeft: '#00f0ff', axisTextRight: '#ff007f' },
      4: { bgColor: '#0d0221', team1: '#00f0ff', team2: '#ff007f', radarTick: '#ffe600', radarGrid: '#2d1b69' },
      5: { bgColor: '#0d0221', team1: '#00f0ff', team2: '#ff007f', lineStroke: '#7122fa', textColor: '#ffffff' },
      6: { bgColor: '#0d0221', radarFill: '#ff007f', badgeBg: '#180738', badgeBorder: '#00f0ff', badgeText: '#ffe600', gridStroke: '#2d1b69' },
      7: { bgColor: '#0d0221', player1Color: '#00f0ff', player2Color: '#ff007f', borderColor: '#ffe600', textColor: '#ffffff', labelColor: '#00f0ff' },
      8: { col1: '#FFE600', colDark: '#0D0221', colPurple: '#7122FA', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#00F0FF', team2: '#FF007F', team3: '#FFE600', team4: '#7122FA', axisColor: '#00F0FF', gridColor: '#000000' },
      10: { teamABg: '#0D0221', teamBBg: '#7122FA', vsBadge: '#00F0FF', labelColor: '#FF007F', accentGold: '#FFE600', accentMint: '#00F0FF' },
      11: { p1Plate: '#ffffff', p2Plate: '#7122FA', gaugeDark: '#0D0221', gaugePurple: '#FF007F', accentGold: '#00F0FF', labelColor: '#FF007F' },
      12: { w1Color: '#00F0FF', w2Color: '#FF007F', w3Color: '#FFE600', w4Color: '#7122FA', w5Color: '#0D0221' },
      13: { headerGold: '#FFE600', headerPurple: '#7122FA', headerDark: '#0D0221', totalPtsGold: '#FFE600', accentMint: '#00F0FF', accentCrimson: '#FF007F' },
    },
  },
  {
    id: 'booyah_gold',
    name: 'Booyah Gold Champion',
    tag: 'Winner Crown',
    swatches: ['#0F172A', '#F59E0B', '#D97706', '#FDE047', '#F8FAFC'],
    slideThemes: {
      1: { bgColor: '#0f172a', barFill: '#f59e0b', lineStroke: '#fde047', lineLabel: '#000000', barLabel: '#000000', axisText: '#ffffff' },
      2: { bgColor: '#0f172a', primaryBar: '#f59e0b', secondaryBar: '#d97706', barText: '#ffffff', axisText: '#ffffff', axisLine: '#fde047' },
      3: { bgColor: '#0f172a', killPoints: '#f59e0b', survivalScore: '#d97706', damage: '#fde047', axisTextLeft: '#fde047', axisTextRight: '#f59e0b' },
      4: { bgColor: '#0f172a', team1: '#f59e0b', team2: '#d97706', radarTick: '#fde047', radarGrid: '#334155' },
      5: { bgColor: '#0f172a', team1: '#f59e0b', team2: '#d97706', lineStroke: '#64748b', textColor: '#ffffff' },
      6: { bgColor: '#0f172a', radarFill: '#f59e0b', badgeBg: '#1e293b', badgeBorder: '#fde047', badgeText: '#ffffff', gridStroke: '#334155' },
      7: { bgColor: '#0f172a', player1Color: '#f59e0b', player2Color: '#d97706', borderColor: '#fde047', textColor: '#ffffff', labelColor: '#ffffff' },
      8: { col1: '#FDE047', colDark: '#0F172A', colPurple: '#D97706', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#FDE047', team2: '#F59E0B', team3: '#D97706', team4: '#B45309', axisColor: '#D97706', gridColor: '#000000' },
      10: { teamABg: '#0F172A', teamBBg: '#D97706', vsBadge: '#FDE047', labelColor: '#D97706', accentGold: '#FDE047', accentMint: '#F59E0B' },
      11: { p1Plate: '#ffffff', p2Plate: '#D97706', gaugeDark: '#0F172A', gaugePurple: '#D97706', accentGold: '#FDE047', labelColor: '#D97706' },
      12: { w1Color: '#FDE047', w2Color: '#F59E0B', w3Color: '#D97706', w4Color: '#B45309', w5Color: '#0F172A' },
      13: { headerGold: '#FDE047', headerPurple: '#D97706', headerDark: '#0F172A', totalPtsGold: '#FDE047', accentMint: '#F59E0B', accentCrimson: '#B45309' },
    },
  },
  {
    id: 'toxic_matrix',
    name: 'Toxic Matrix Emerald',
    tag: 'Bio Energy',
    swatches: ['#051A14', '#00FF88', '#10B981', '#FACC15', '#064E3B'],
    slideThemes: {
      1: { bgColor: '#051a14', barFill: '#00ff88', lineStroke: '#facc15', lineLabel: '#000000', barLabel: '#000000', axisText: '#ffffff' },
      2: { bgColor: '#051a14', primaryBar: '#00ff88', secondaryBar: '#10b981', barText: '#000000', axisText: '#ffffff', axisLine: '#facc15' },
      3: { bgColor: '#051a14', killPoints: '#00ff88', survivalScore: '#10b981', damage: '#facc15', axisTextLeft: '#00ff88', axisTextRight: '#facc15' },
      4: { bgColor: '#051a14', team1: '#00ff88', team2: '#10b981', radarTick: '#00ff88', radarGrid: '#064e3b' },
      5: { bgColor: '#051a14', team1: '#00ff88', team2: '#10b981', lineStroke: '#047857', textColor: '#ffffff' },
      6: { bgColor: '#051a14', radarFill: '#10b981', badgeBg: '#022c22', badgeBorder: '#00ff88', badgeText: '#ffffff', gridStroke: '#064e3b' },
      7: { bgColor: '#051a14', player1Color: '#00ff88', player2Color: '#10b981', borderColor: '#facc15', textColor: '#ffffff', labelColor: '#00ff88' },
      8: { col1: '#00FF88', colDark: '#051A14', colPurple: '#10B981', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#00FF88', team2: '#10B981', team3: '#34D399', team4: '#FACC15', axisColor: '#10B981', gridColor: '#000000' },
      10: { teamABg: '#051A14', teamBBg: '#10B981', vsBadge: '#00FF88', labelColor: '#10B981', accentGold: '#FACC15', accentMint: '#00FF88' },
      11: { p1Plate: '#ffffff', p2Plate: '#10B981', gaugeDark: '#051A14', gaugePurple: '#10B981', accentGold: '#00FF88', labelColor: '#10B981' },
      12: { w1Color: '#00FF88', w2Color: '#10B981', w3Color: '#34D399', w4Color: '#FACC15', w5Color: '#051A14' },
      13: { headerGold: '#00FF88', headerPurple: '#10B981', headerDark: '#051A14', totalPtsGold: '#FACC15', accentMint: '#00FF88', accentCrimson: '#EF4444' },
    },
  },
  {
    id: 'blood_inferno',
    name: 'Bloodline Inferno',
    tag: 'Aggressive Strike',
    swatches: ['#180808', '#FF2E00', '#FF9900', '#FFD700', '#450A0A'],
    slideThemes: {
      1: { bgColor: '#180808', barFill: '#ff2e00', lineStroke: '#ffd700', lineLabel: '#000000', barLabel: '#ffffff', axisText: '#ffffff' },
      2: { bgColor: '#180808', primaryBar: '#ff2e00', secondaryBar: '#ff9900', barText: '#ffffff', axisText: '#ffffff', axisLine: '#ffd700' },
      3: { bgColor: '#180808', killPoints: '#ff2e00', survivalScore: '#ff9900', damage: '#ffd700', axisTextLeft: '#ff9900', axisTextRight: '#ffd700' },
      4: { bgColor: '#180808', team1: '#ff2e00', team2: '#ff9900', radarTick: '#ffd700', radarGrid: '#450a0a' },
      5: { bgColor: '#180808', team1: '#ff2e00', team2: '#ff9900', lineStroke: '#7f1d1d', textColor: '#ffffff' },
      6: { bgColor: '#180808', radarFill: '#ff2e00', badgeBg: '#2a0a0a', badgeBorder: '#ffd700', badgeText: '#ffffff', gridStroke: '#450a0a' },
      7: { bgColor: '#180808', player1Color: '#ff2e00', player2Color: '#ff9900', borderColor: '#ffd700', textColor: '#ffffff', labelColor: '#ff9900' },
      8: { col1: '#FFD700', colDark: '#180808', colPurple: '#FF2E00', borderCol: '#000000', textNum: '#000000' },
      9: { team1: '#FFD700', team2: '#FF2E00', team3: '#FF9900', team4: '#B91C1C', axisColor: '#FF2E00', gridColor: '#000000' },
      10: { teamABg: '#180808', teamBBg: '#FF2E00', vsBadge: '#FFD700', labelColor: '#FF2E00', accentGold: '#FFD700', accentMint: '#FF9900' },
      11: { p1Plate: '#ffffff', p2Plate: '#FF2E00', gaugeDark: '#180808', gaugePurple: '#FF2E00', accentGold: '#FFD700', labelColor: '#FF2E00' },
      12: { w1Color: '#FFD700', w2Color: '#FF2E00', w3Color: '#FF9900', w4Color: '#B91C1C', w5Color: '#180808' },
      13: { headerGold: '#FFD700', headerPurple: '#FF2E00', headerDark: '#180808', totalPtsGold: '#FFD700', accentMint: '#FF9900', accentCrimson: '#DC2626' },
    },
  },
];

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
        desc: 'White bars with gold damage curve',
        colors: { bgColor: '#18191a', barFill: '#ffffff', lineStroke: '#ffc600', lineLabel: '#000000', barLabel: '#000000', axisText: '#ffffff' },
      },
      {
        name: 'RTB Esports Blue',
        desc: 'Cobalt blue and electric cyan',
        colors: { bgColor: '#0b0e14', barFill: '#1877f2', lineStroke: '#00e5ff', lineLabel: '#00e5ff', barLabel: '#ffffff', axisText: '#e4e6eb' },
      },
      {
        name: 'Toxic Neon',
        desc: 'Acid green and cyber pink',
        colors: { bgColor: '#101712', barFill: '#00ff88', lineStroke: '#ff007f', lineLabel: '#ff007f', barLabel: '#000000', axisText: '#ffffff' },
      },
      {
        name: 'Inferno Flame',
        desc: 'Tactical red and flame yellow',
        colors: { bgColor: '#180808', barFill: '#ef4444', lineStroke: '#f59e0b', lineLabel: '#ffffff', barLabel: '#000000', axisText: '#ffffff' },
      },
      {
        name: 'Royal Purple',
        desc: 'Deep violet and amber gold',
        colors: { bgColor: '#0f0c20', barFill: '#8b5cf6', lineStroke: '#f59e0b', lineLabel: '#ffffff', barLabel: '#000000', axisText: '#e2e8f0' },
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
        desc: 'Signature demo-graph-bd theme',
        colors: { bgColor: '#18191a', primaryBar: '#000000', secondaryBar: '#692fb2', barText: '#ffffff', axisText: '#000000', axisLine: '#000000' },
      },
      {
        name: 'RTB Blue & Gold',
        desc: 'Esports blue and gold highlight',
        colors: { bgColor: '#0b0e14', primaryBar: '#1877f2', secondaryBar: '#ffd700', barText: '#ffffff', axisText: '#ffffff', axisLine: '#ffffff40' },
      },
      {
        name: 'Cyber Cyan & Violet',
        desc: 'Neon cyan with electric purple',
        colors: { bgColor: '#0b0e14', primaryBar: '#00e5ff', secondaryBar: '#a855f7', barText: '#000000', axisText: '#e4e6eb', axisLine: '#3a3b3c' },
      },
      {
        name: 'Crimson & Sky',
        desc: 'Tactical crimson with ice blue',
        colors: { bgColor: '#0f172a', primaryBar: '#e11d48', secondaryBar: '#38bdf8', barText: '#ffffff', axisText: '#f8fafc', axisLine: '#475569' },
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
        desc: 'Cyan, gold and hot magenta lines',
        colors: { bgColor: '#18191a', killPoints: '#00ffa3', survivalScore: '#ffea00', damage: '#ff00a0', axisTextLeft: '#ffffff80', axisTextRight: '#ff00a0' },
      },
      {
        name: 'RGB Laser',
        desc: 'Cyan, yellow and laser red',
        colors: { bgColor: '#0b0e14', killPoints: '#00ffff', survivalScore: '#ffff00', damage: '#ff0055', axisTextLeft: '#e4e6eb', axisTextRight: '#ff0055' },
      },
      {
        name: 'Fire & Ice',
        desc: 'Electric ice blue with fiery orange',
        colors: { bgColor: '#0b0e14', killPoints: '#00e5ff', survivalScore: '#ffffff', damage: '#ff4500', axisTextLeft: '#ffffff', axisTextRight: '#ff4500' },
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
        desc: 'Dark slate polygon vs royal purple',
        colors: { bgColor: '#18191a', team1: '#1f2937', team2: '#692fb2', radarTick: '#692fb2', radarGrid: '#1f2937' },
      },
      {
        name: 'Cyber Strike',
        desc: 'Neon cyan vs hot magenta',
        colors: { bgColor: '#0b0e14', team1: '#00e5ff', team2: '#ec4899', radarTick: '#00e5ff', radarGrid: '#374151' },
      },
      {
        name: 'Gold vs Emerald',
        desc: 'Booyah gold with toxic emerald',
        colors: { bgColor: '#121411', team1: '#ffd700', team2: '#00ff88', radarTick: '#ffffff', radarGrid: '#2c3329' },
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
        desc: 'Dark charcoal and purple trend line',
        colors: { bgColor: '#18191a', team1: '#000000', team2: '#692fb2', lineStroke: '#6b7280', textColor: '#ffffff' },
      },
      {
        name: 'Gold vs Crimson',
        desc: 'Championship gold vs combat crimson',
        colors: { bgColor: '#0b0e14', team1: '#ffd700', team2: '#ef4444', lineStroke: '#4b5563', textColor: '#f3f4f6' },
      },
      {
        name: 'Cyan vs Rose',
        desc: 'Electric cyan and rose magenta',
        colors: { bgColor: '#061325', team1: '#06b6d4', team2: '#f43f5e', lineStroke: '#334155', textColor: '#f8fafc' },
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
        desc: 'Royal violet with black badges',
        colors: { bgColor: '#18191a', radarFill: '#692fb2', badgeBg: '#000000', badgeBorder: '#692fb2', badgeText: '#ffffff', gridStroke: '#333333' },
      },
      {
        name: 'Matrix Mint',
        desc: 'Acid green polygon with emerald borders',
        colors: { bgColor: '#0a0f0d', radarFill: '#10b981', badgeBg: '#022c22', badgeBorder: '#34d399', badgeText: '#ffffff', gridStroke: '#064e3b' },
      },
      {
        name: 'Golden Booyah',
        desc: 'Peak gold fill with amber badge',
        colors: { bgColor: '#121008', radarFill: '#f59e0b', badgeBg: '#1c1917', badgeBorder: '#d97706', badgeText: '#ffffff', gridStroke: '#44403c' },
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
        desc: 'Dark charcoal vs signature purple',
        colors: { bgColor: '#18191a', player1Color: '#000000', player2Color: '#692fb2', borderColor: '#004b87', textColor: '#ffffff', labelColor: '#ffffff' },
      },
      {
        name: 'Crimson vs Cyan',
        desc: 'Tactical red vs electric cyan',
        colors: { bgColor: '#0b0e14', player1Color: '#ef4444', player2Color: '#06b6d4', borderColor: '#f59e0b', textColor: '#ffffff', labelColor: '#f3f4f6' },
      },
      {
        name: 'Gold vs Emerald',
        desc: 'Booyah gold vs toxic green',
        colors: { bgColor: '#141410', player1Color: '#ffd700', player2Color: '#00ff88', borderColor: '#3b3b24', textColor: '#ffffff', labelColor: '#ffffff' },
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
        desc: 'Championship gold with dark & purple columns',
        colors: { col1: '#F5B700', colDark: '#111827', colPurple: '#6225A6', borderCol: '#000000', textNum: '#000000' },
      },
      {
        name: 'FFWS Championship',
        desc: 'Gold peak with carbon & tactical crimson',
        colors: { col1: '#F59E0B', colDark: '#0B0F19', colPurple: '#E11D48', borderCol: '#000000', textNum: '#000000' },
      },
      {
        name: 'Cyber Cyan & Violet',
        desc: 'Electric mint peak with slate & violet',
        colors: { col1: '#00DF82', colDark: '#0f172a', colPurple: '#7c3aed', borderCol: '#000000', textNum: '#000000' },
      },
      {
        name: 'Toxic Matrix',
        desc: 'Neon mint with bio dark and emerald',
        colors: { col1: '#00FF88', colDark: '#051A14', colPurple: '#10B981', borderCol: '#000000', textNum: '#000000' },
      },
      {
        name: 'Bloodline Inferno',
        desc: 'Flame gold with obsidian and blaze red',
        colors: { col1: '#FFD700', colDark: '#180808', colPurple: '#FF2E00', borderCol: '#000000', textNum: '#000000' },
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
        desc: 'Gold, purple, mint, and hot pink',
        colors: { team1: '#F5B700', team2: '#6225A6', team3: '#00DF82', team4: '#EC008C', axisColor: '#6225A6', gridColor: '#000000' },
      },
      {
        name: 'FFWS Official 4',
        desc: 'Booyah gold, crimson, cyan and violet',
        colors: { team1: '#F59E0B', team2: '#E11D48', team3: '#06B6D4', team4: '#7C3AED', axisColor: '#06B6D4', gridColor: '#000000' },
      },
      {
        name: 'Neon Laser',
        desc: 'Cyan, magenta, yellow and toxic green',
        colors: { team1: '#00ffff', team2: '#ff007f', team3: '#ffea00', team4: '#00ff88', axisColor: '#00ffff', gridColor: '#000000' },
      },
      {
        name: 'Golden Champion',
        desc: 'Tonal gold and amber progression',
        colors: { team1: '#F59E0B', team2: '#D97706', team3: '#B45309', team4: '#FBBF24', axisColor: '#F59E0B', gridColor: '#000000' },
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
        desc: 'Obsidian carbon vs signature purple',
        colors: { teamABg: '#111827', teamBBg: '#6225A6', vsBadge: '#F5B700', labelColor: '#6225A6', accentGold: '#F5B700', accentMint: '#00DF82' },
      },
      {
        name: 'FFWS Fire vs Ice',
        desc: 'Midnight carbon vs tactical crimson with gold VS',
        colors: { teamABg: '#0B0F19', teamBBg: '#E11D48', vsBadge: '#F59E0B', labelColor: '#06B6D4', accentGold: '#F59E0B', accentMint: '#06B6D4' },
      },
      {
        name: 'Crimson vs Cyan',
        desc: 'Tactical red vs electric cyan clash',
        colors: { teamABg: '#1e1b4b', teamBBg: '#dc2626', vsBadge: '#06b6d4', labelColor: '#06b6d4', accentGold: '#06b6d4', accentMint: '#f59e0b' },
      },
      {
        name: 'Emerald vs Amber',
        desc: 'Bio void dark vs matrix emerald',
        colors: { teamABg: '#051A14', teamBBg: '#10B981', vsBadge: '#F59E0B', labelColor: '#10B981', accentGold: '#F59E0B', accentMint: '#34D399' },
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
        desc: 'White vs purple plates with gold contact dot',
        colors: { p1Plate: '#ffffff', p2Plate: '#6225A6', gaugeDark: '#111827', gaugePurple: '#6225A6', accentGold: '#F5B700', labelColor: '#6225A6' },
      },
      {
        name: 'FFWS Official Duel',
        desc: 'White plate vs tactical crimson with gold gauge',
        colors: { p1Plate: '#ffffff', p2Plate: '#E11D48', gaugeDark: '#0B0F19', gaugePurple: '#E11D48', accentGold: '#F59E0B', labelColor: '#E11D48' },
      },
      {
        name: 'Gold & Obsidian',
        desc: 'White plate vs amber gold with dark gauge',
        colors: { p1Plate: '#ffffff', p2Plate: '#d97706', gaugeDark: '#111827', gaugePurple: '#d97706', accentGold: '#f59e0b', labelColor: '#d97706' },
      },
      {
        name: 'Cyan vs Magenta',
        desc: 'White plate vs neon cyan and magenta gauge',
        colors: { p1Plate: '#ffffff', p2Plate: '#06B6D4', gaugeDark: '#111827', gaugePurple: '#EC008C', accentGold: '#F59E0B', labelColor: '#06B6D4' },
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
        desc: 'Purple, pink, gold, mint, and dark navy',
        colors: { w1Color: '#6225A6', w2Color: '#EC008C', w3Color: '#F5B700', w4Color: '#00DF82', w5Color: '#111827' },
      },
      {
        name: 'FFWS Weapon Meta',
        desc: 'Gold, crimson, cyan, violet, and emerald',
        colors: { w1Color: '#F59E0B', w2Color: '#E11D48', w3Color: '#06B6D4', w4Color: '#7C3AED', w5Color: '#10B981' },
      },
      {
        name: 'Cyberpunk Neon',
        desc: 'Cyan, hot magenta, laser yellow, and neon green',
        colors: { w1Color: '#00ffff', w2Color: '#ff007f', w3Color: '#ffff00', w4Color: '#39ff14', w5Color: '#1e1b4b' },
      },
      {
        name: 'Golden Arsenal',
        desc: 'Championship gold with amber and bronze rings',
        colors: { w1Color: '#F59E0B', w2Color: '#D97706', w3Color: '#B45309', w4Color: '#FBBF24', w5Color: '#78350F' },
      },
    ],
  },
  {
    id: 13,
    name: 'Slide 13',
    title: 'FFWS Wipe Standing — Top 12 Teams',
    desc: 'Diagonal wipe cascade leaderboard with skewed tags, dynamic rank deltas, and live DayStanding sheet sync',
    storageKey: 'rtb_colors_dashboard13',
    defaults: {
      headerGold: '#F5B700',
      headerPurple: '#6225A6',
      headerDark: '#2E0E56',
      totalPtsGold: '#F5B700',
      accentMint: '#00DF82',
      accentCrimson: '#FF3B5C',
    },
    fields: [
      { key: 'headerGold', label: 'Booyah Gold Accent', defaultVal: '#F5B700', desc: 'Main header crown & #1 highlight' },
      { key: 'headerPurple', label: 'Primary Brand Purple', defaultVal: '#6225A6', desc: 'Secondary angled header block' },
      { key: 'headerDark', label: 'Obsidian Header Base', defaultVal: '#2E0E56', desc: 'Base dark angled background' },
      { key: 'totalPtsGold', label: 'Total Points Column Accent', defaultVal: '#F5B700', desc: 'Pts score text & gold glow' },
      { key: 'accentMint', label: 'Rank Up Indicator', defaultVal: '#00DF82', desc: '▲ Delta rank gain badge' },
      { key: 'accentCrimson', label: 'Rank Drop Indicator', defaultVal: '#FF3B5C', desc: '▼ Delta rank loss badge' },
    ],
    presets: [
      {
        name: 'Demo-Graph BD Signature',
        desc: 'Gold, purple, obsidian, and neon accents',
        colors: {
          headerGold: '#F5B700',
          headerPurple: '#6225A6',
          headerDark: '#2E0E56',
          totalPtsGold: '#F5B700',
          accentMint: '#00DF82',
          accentCrimson: '#FF3B5C',
        },
      },
      {
        name: 'FFWS World Series',
        desc: 'Booyah gold with tactical crimson and electric cyan',
        colors: {
          headerGold: '#F59E0B',
          headerPurple: '#E11D48',
          headerDark: '#0B0F19',
          totalPtsGold: '#F59E0B',
          accentMint: '#06B6D4',
          accentCrimson: '#E11D48',
        },
      },
      {
        name: 'Cyberpunk Neon',
        desc: 'Laser yellow, neon purple, and neon cyan',
        colors: {
          headerGold: '#FFE600',
          headerPurple: '#7122FA',
          headerDark: '#0D0221',
          totalPtsGold: '#FFE600',
          accentMint: '#00F0FF',
          accentCrimson: '#FF007F',
        },
      },
      {
        name: 'Toxic Matrix',
        desc: 'Neon mint with bio dark and emerald',
        colors: {
          headerGold: '#00FF88',
          headerPurple: '#10B981',
          headerDark: '#051A14',
          totalPtsGold: '#FACC15',
          accentMint: '#00FF88',
          accentCrimson: '#EF4444',
        },
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
        {activeSlideId === 13 && <Dashboard13 overrideColors={currentColors} />}
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeSlide = SLIDES[activeSlideIndex] || SLIDES[0];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

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

  const applyPreset = (presetColors: Record<string, string>, name?: string) => {
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
      .then(() => {
        setIsSavedSync(true);
        if (name) triggerToast(`Applied: ${name}`);
      })
      .catch(() => setIsSavedSync(true));
  };

  // Apply a Master Tournament Palette across ALL 12 slides
  const applyMasterPaletteToAll = (palette: MasterPalette) => {
    setIsSavedSync(false);
    const themesToPost: Record<string, any> = {};

    SLIDES.forEach((slide) => {
      const colorsForSlide = palette.slideThemes[slide.id] || slide.defaults;
      try {
        localStorage.setItem(slide.storageKey, JSON.stringify(colorsForSlide));
      } catch {}
      themesToPost[`dashboard${slide.id}`] = colorsForSlide;
    });

    // Update active slide state immediately
    if (palette.slideThemes[activeSlide.id]) {
      setCurrentColors(palette.slideThemes[activeSlide.id]);
    }

    window.dispatchEvent(new Event('storage'));

    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themes: themesToPost }),
    })
      .then(() => {
        setIsSavedSync(true);
        triggerToast(`⚡ Synced "${palette.name}" to all 12 overlays!`);
      })
      .catch(() => setIsSavedSync(true));
  };

  // Apply Master Palette to Active Slide Only
  const applyMasterPaletteToActive = (palette: MasterPalette) => {
    if (palette.slideThemes[activeSlide.id]) {
      applyPreset(palette.slideThemes[activeSlide.id], `${palette.name} on Slide ${activeSlide.id}`);
    }
  };

  const resetToDefault = () => {
    applyPreset(activeSlide.defaults, `Reset Slide ${activeSlide.id}`);
  };

  const copyObsUrl = (id: number) => {
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(`obs-${id}`);
    triggerToast(`Copied OBS URL for Slide ${id}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <span>✓</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header Bar */}
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
              className={`text-xs px-3 py-1 rounded-full font-bold border transition ${
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

        {/* ==================== GLOBAL MASTER COLOR PALETTES (কালার প্লেটসমূহ) ==================== */}
        <div className="p-5 rounded-2xl bg-[#242526] border border-[#3a3b3c] shadow-lg space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Master Tournament Color Palettes (গ্লোবাল কালার প্লেট)
                </h2>
              </div>
              <p className="text-[11px] text-[#b0b3b8] mt-0.5">
                Click any palette to recolor the active slide, or click "Apply to All" to theme the entire broadcast!
              </p>
            </div>
          </div>

          {/* Master Palette Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {MASTER_PALETTES.map((pal) => (
              <div
                key={pal.id}
                className="p-3.5 rounded-xl bg-[#18191a] border border-[#3a3b3c] hover:border-[#1877f2] transition flex flex-col justify-between gap-2.5 shadow group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-title text-xs font-bold text-white group-hover:text-amber-400 transition">
                      {pal.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#b0b3b8] block mt-0.5">
                    {pal.tag}
                  </span>

                  {/* 5-Color Swatch Plate (কালার প্লেট বার) */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {pal.swatches.map((color, sIdx) => (
                      <span
                        key={sIdx}
                        className="flex-1 h-5 rounded-md border border-black/60 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-[#3a3b3c]/60">
                  <button
                    type="button"
                    onClick={() => applyMasterPaletteToActive(pal)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] text-white text-[10px] font-bold transition text-center"
                    title={`Apply ${pal.name} to Slide ${activeSlide.id}`}
                  >
                    Slide {activeSlide.id}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMasterPaletteToAll(pal)}
                    className="py-1 px-2 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white text-[10px] font-black transition"
                    title={`Apply ${pal.name} across ALL 12 slides simultaneously`}
                  >
                    All 12 ⚡
                  </button>
                </div>
              </div>
            ))}
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

              {/* Slide Color Palettes (স্লাইডের কালার প্লেট কার্ডস) */}
              {activeSlide.presets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#b0b3b8]">
                      Slide {activeSlide.id} Color Palettes (কালার প্লেটসমূহ):
                    </span>
                    <span className="text-[10px] text-amber-400 font-num">
                      {activeSlide.presets.length} Palettes Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeSlide.presets.map((p) => {
                      const swatchList = Object.values(p.colors);
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => applyPreset(p.colors, p.name)}
                          className="p-3 rounded-xl bg-[#18191a] hover:bg-[#202224] border border-[#3a3b3c] hover:border-[#1877f2] transition flex flex-col justify-between gap-2 text-left group"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-title text-xs font-bold text-white group-hover:text-[#1877f2] transition">
                              ⚡ {p.name}
                            </span>
                            <span className="text-[9px] text-[#b0b3b8] font-num">Click to apply</span>
                          </div>

                          {p.desc && (
                            <span className="text-[10px] text-[#b0b3b8] leading-tight">
                              {p.desc}
                            </span>
                          )}

                          {/* Visual Color Swatches Strip (কালার প্লেট) */}
                          <div className="flex items-center gap-1.5 w-full pt-1">
                            {swatchList.slice(0, 6).map((color, cIdx) => (
                              <span
                                key={cIdx}
                                className="flex-1 h-4 rounded-md border border-black/50 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Individual Element Color Pickers */}
              <div className="space-y-4 pt-2 border-t border-[#3a3b3c]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b0b3b8]">
                    Fine-Tune Element Colors (কাস্টম কালার নির্বাচন):
                  </span>
                  <span className="text-[10px] text-[#b0b3b8]">Click color box to open picker</span>
                </div>

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
