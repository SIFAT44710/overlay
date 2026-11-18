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
    name: 'Graph 1',
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
      {
        name: 'Inferno Amber',
        colors: { bgColor: '#180d0d', barFill: '#ff4500', lineStroke: '#ffd700', lineLabel: '#ffd700', barLabel: '#ffffff', axisText: '#ffffff' },
      },
    ],
  },
  {
    id: 2,
    name: 'Graph 2',
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
    name: 'Graph 3',
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
      { key: 'killPoints', label: 'Kill Points Line', defaultVal: '#00ffa3', desc: 'Neon green line for kills' },
      { key: 'survivalScore', label: 'Survival Score Line', defaultVal: '#ffea00', desc: 'Yellow line for survival score' },
      { key: 'damage', label: 'Damage Trend Line', defaultVal: '#ff00a0', desc: 'Pink line for total damage' },
      { key: 'axisTextLeft', label: 'Left Axis Text', defaultVal: '#ffffff80', desc: 'Scale numbers on the left' },
      { key: 'axisTextRight', label: 'Right Axis Text', defaultVal: '#ff00a0', desc: 'Scale numbers on the right' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Neon Cyber Trio',
        colors: { bgColor: '#18191a', killPoints: '#00ffa3', survivalScore: '#ffea00', damage: '#ff00a0', axisTextLeft: '#ffffff80', axisTextRight: '#ff00a0' },
      },
      {
        name: 'Fire & Ice',
        colors: { bgColor: '#0b0e14', killPoints: '#00e5ff', survivalScore: '#ffffff', damage: '#ff4500', axisTextLeft: '#ffffff', axisTextRight: '#ff4500' },
      },
    ],
  },
  {
    id: 4,
    name: 'Graph 4',
    title: 'Team H2H Radar',
    desc: 'Polygon radar comparing 2 teams across Kills, Damage, Assist & Knockdown',
    storageKey: 'rtb_colors_dashboard4',
    defaults: {
      bgColor: '#18191a',
      team1: '#1f2937',
      team2: '#692fb2',
      radarTick: '#692fb2',
      radarGrid: '#1f2937',
    },
    fields: [
      { key: 'team1', label: 'Team 1 (Left Team)', defaultVal: '#1f2937', desc: 'Color of Team 1 polygon & badges' },
      { key: 'team2', label: 'Team 2 (Right Team)', defaultVal: '#692fb2', desc: 'Color of Team 2 polygon & badges' },
      { key: 'radarTick', label: 'Radar Axis Labels', defaultVal: '#692fb2', desc: 'Text for KILL PTS, DAMAGE, etc.' },
      { key: 'radarGrid', label: 'Radar Web Grid', defaultVal: '#1f2937', desc: 'Spider grid lines' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Charcoal vs Purple',
        colors: { bgColor: '#18191a', team1: '#1f2937', team2: '#692fb2', radarTick: '#692fb2', radarGrid: '#1f2937' },
      },
      {
        name: 'Blue vs Red Fire',
        colors: { bgColor: '#0f1115', team1: '#1877f2', team2: '#ff1744', radarTick: '#ffffff', radarGrid: '#2a2f38' },
      },
      {
        name: 'Gold vs Emerald',
        colors: { bgColor: '#121411', team1: '#ffd700', team2: '#00ff88', radarTick: '#ffffff', radarGrid: '#2c3329' },
      },
    ],
  },
  {
    id: 5,
    name: 'Graph 5',
    title: 'Team H2H V-Progression',
    desc: 'Connecting progression line with animated pulsing badges for 2 teams',
    storageKey: 'rtb_colors_dashboard5',
    defaults: {
      bgColor: '#18191a',
      team1: '#000000',
      team2: '#692fb2',
      lineStroke: '#6b7280',
      textColor: '#ffffff',
    },
    fields: [
      { key: 'team1', label: 'Team 1 Theme', defaultVal: '#000000', desc: 'Dot, badge & bar color for Team 1' },
      { key: 'team2', label: 'Team 2 Theme', defaultVal: '#692fb2', desc: 'Dot, badge & bar color for Team 2' },
      { key: 'lineStroke', label: 'Connection Line', defaultVal: '#6b7280', desc: 'Line connecting the stat nodes' },
      { key: 'textColor', label: 'Badge Text Color', defaultVal: '#ffffff', desc: 'Text inside floating badges' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Classic Black & Purple',
        colors: { bgColor: '#18191a', team1: '#000000', team2: '#692fb2', lineStroke: '#6b7280', textColor: '#ffffff' },
      },
      {
        name: 'Blue & Amber',
        colors: { bgColor: '#0e1217', team1: '#1877f2', team2: '#ff9900', lineStroke: '#556677', textColor: '#ffffff' },
      },
    ],
  },
  {
    id: 6,
    name: 'Graph 6',
    title: 'MVP Pentagon Radar',
    desc: 'Player of the match 5-axis radar polygon with floating stat badges',
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
      { key: 'radarFill', label: 'MVP Radar Polygon', defaultVal: '#692fb2', desc: 'Color of MVP radar fill and glow' },
      { key: 'badgeBorder', label: 'Stat Badge Border', defaultVal: '#692fb2', desc: 'Border around the 5 stat boxes' },
      { key: 'badgeBg', label: 'Stat Badge Background', defaultVal: '#000000', desc: 'Background of stat badge cards' },
      { key: 'badgeText', label: 'Badge Text Color', defaultVal: '#ffffff', desc: 'Metric numbers and labels' },
      { key: 'gridStroke', label: 'Polygon Grid Lines', defaultVal: '#333333', desc: 'Web grid color' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Royal MVP Purple',
        colors: { bgColor: '#18191a', radarFill: '#692fb2', badgeBg: '#000000', badgeBorder: '#692fb2', badgeText: '#ffffff', gridStroke: '#333333' },
      },
      {
        name: 'Golden Champion',
        colors: { bgColor: '#121008', radarFill: '#ffd700', badgeBg: '#1f1b07', badgeBorder: '#ffd700', badgeText: '#ffffff', gridStroke: '#443c16' },
      },
      {
        name: 'Cyberpunk Red',
        colors: { bgColor: '#140a0c', radarFill: '#ff0055', badgeBg: '#210c12', badgeBorder: '#ff0055', badgeText: '#ffffff', gridStroke: '#421622' },
      },
    ],
  },
  {
    id: 7,
    name: 'Graph 7',
    title: 'Player 1v1 PvP Showdown',
    desc: 'Head-to-head top fragger duel with skewed ratio bars and animated counter',
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
      { key: 'player1Color', label: 'Player 1 Theme (Left)', defaultVal: '#000000', desc: 'Color for Player 1 bar and header' },
      { key: 'player2Color', label: 'Player 2 Theme (Right)', defaultVal: '#692fb2', desc: 'Color for Player 2 bar and header' },
      { key: 'borderColor', label: 'Bar Outer Border', defaultVal: '#004b87', desc: 'Skewed bar container frame border' },
      { key: 'textColor', label: 'Score Numbers Color', defaultVal: '#ffffff', desc: 'Animated counter text color' },
      { key: 'labelColor', label: 'Category Label Color', defaultVal: '#ffffff', desc: 'ELIMS, DAMAGE, HEADSHOT text' },
      { key: 'bgColor', label: 'Preview Canvas Bg', defaultVal: '#18191a', desc: 'Background color' },
    ],
    presets: [
      {
        name: 'Black vs Purple Duel',
        colors: { bgColor: '#18191a', player1Color: '#000000', player2Color: '#692fb2', borderColor: '#004b87', textColor: '#ffffff', labelColor: '#ffffff' },
      },
      {
        name: 'Red Fire vs Ice Blue',
        colors: { bgColor: '#0e1117', player1Color: '#ff1744', player2Color: '#00d2ff', borderColor: '#2d3748', textColor: '#ffffff', labelColor: '#ffffff' },
      },
      {
        name: 'Gold vs Toxic Green',
        colors: { bgColor: '#141410', player1Color: '#ffd700', player2Color: '#00ff88', borderColor: '#3b3b24', textColor: '#ffffff', labelColor: '#ffffff' },
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
      </div>
      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-neutral-300 border border-white/10 z-20">
        Live 1080p Stage
      </div>
    </div>
  );
}

export default function AdminPalettePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  
  const [activeSlideId, setActiveSlideId] = useState<number>(1);
  const [colorState, setColorState] = useState<Record<string, Record<string, string>>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<'dark' | 'transparent' | 'stream'>('dark');

  // Check auth on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionAuth = sessionStorage.getItem('overlay_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load colors from localStorage for each slide
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial: Record<string, Record<string, string>> = {};
    SLIDES.forEach((slide) => {
      try {
        const saved = localStorage.getItem(slide.storageKey);
        if (saved) {
          initial[slide.storageKey] = { ...slide.defaults, ...JSON.parse(saved) };
        } else {
          initial[slide.storageKey] = { ...slide.defaults };
        }
      } catch {
        initial[slide.storageKey] = { ...slide.defaults };
      }
    });
    setColorState(initial);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passcodes: admin, 1234, sifat, sifat123
    const validCodes = ['admin', '1234', 'sifat', 'sifat123', 'overlay'];
    if (validCodes.includes(passwordInput.trim().toLowerCase())) {
      setIsAuthenticated(true);
      sessionStorage.setItem('overlay_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid password. Access restricted to authorized broadcasers.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('overlay_admin_auth');
    setPasswordInput('');
  };

  const activeSlide = SLIDES.find((s) => s.id === activeSlideId) || SLIDES[0];
  const currentColors = colorState[activeSlide.storageKey] || activeSlide.defaults;

  const handleColorChange = (key: string, value: string) => {
    const updated = {
      ...currentColors,
      [key]: value,
    };
    setColorState((prev) => ({
      ...prev,
      [activeSlide.storageKey]: updated,
    }));
    try {
      localStorage.setItem(activeSlide.storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      triggerToast(`Saved ${key} color!`);
    } catch (e) {
      console.error(e);
    }
  };

  const applyPreset = (presetColors: Record<string, string>) => {
    const updated = {
      ...currentColors,
      ...presetColors,
    };
    setColorState((prev) => ({
      ...prev,
      [activeSlide.storageKey]: updated,
    }));
    try {
      localStorage.setItem(activeSlide.storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      triggerToast('Applied theme preset!');
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDefault = () => {
    setColorState((prev) => ({
      ...prev,
      [activeSlide.storageKey]: { ...activeSlide.defaults },
    }));
    try {
      localStorage.removeItem(activeSlide.storageKey);
      window.dispatchEvent(new Event('storage'));
      triggerToast('Reset to defaults!');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const copyObsUrl = (num: number) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/${num}?obs=true`;
    navigator.clipboard.writeText(url);
    setCopiedKey(`obs-${num}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. If not authenticated, render secure login gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#242526] border border-[#3a3b3c] shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/30 flex items-center justify-center text-2xl">
              🔒
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Studio Admin Login
            </h1>
            <p className="text-xs text-[#b0b3b8] mt-1">
              Restricted access. Enter your passcode to customize tournament overlays.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-[#b0b3b8] mb-1.5">
                Passcode / PIN
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (e.g. admin or 1234)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#18191a] border border-[#3a3b3c] text-white text-sm font-semibold focus:border-[#1877f2] focus:outline-none transition"
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#1877f2]/30 cursor-pointer"
            >
              Unlock Admin Studio
            </button>
          </form>

          <div className="mt-6 text-center text-[11px] text-[#b0b3b8]">
            <span>Hint: Default passcode is </span>
            <code className="text-yellow-400 font-mono font-bold">admin</code>
          </div>
        </div>
      </main>
    );
  }

  // 2. If authenticated, render full studio
  return (
    <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] font-sans p-4 sm:p-6 pb-24">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1877f2] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3a3b3c]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-black tracking-widest text-[#1877f2] uppercase">
              Broadcast Studio • Color Palette Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Free Fire Overlay Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#b0b3b8] font-medium mt-1">
            Customize the color palette for each graph independently. Changes apply live to vMix &amp; OBS overlays in real time!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${activeSlide.id}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-2"
          >
            <span>🔥</span>
            <span>Open Slide {activeSlide.id}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] text-rose-400 text-xs font-black uppercase tracking-wider transition border border-rose-500/30"
          >
            Lock / Logout
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs (1 - 7) */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SLIDES.map((slide) => {
            const isActive = slide.id === activeSlideId;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlideId(slide.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition shrink-0 border ${
                  isActive
                    ? 'bg-[#1877f2] text-white border-[#1877f2] shadow-lg shadow-[#1877f2]/20 scale-[1.02]'
                    : 'bg-[#242526] hover:bg-[#3a3b3c] text-[#b0b3b8] border-[#3a3b3c]'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                  isActive ? 'bg-white text-[#1877f2]' : 'bg-black/30 text-yellow-400'
                }`}>
                  {slide.id}
                </span>
                <span className="font-bold">{slide.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Body: Controls on Left, Live Preview on Right */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Color Pickers & Presets (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-5 rounded-2xl bg-[#242526] border border-[#3a3b3c] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#3a3b3c]">
              <div>
                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-[#1877f2]/20 text-[#1877f2] border border-[#1877f2]/40">
                  SLIDE {activeSlide.id} OF 7
                </span>
                <h2 className="text-xl font-black text-white mt-2 uppercase tracking-wide">
                  {activeSlide.title}
                </h2>
                <p className="text-xs text-[#b0b3b8] mt-0.5">{activeSlide.desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-black uppercase transition"
                  title="Reset this slide's palette back to original defaults"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => copyObsUrl(activeSlide.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-neutral-200 text-xs font-black uppercase transition border border-white/10"
                >
                  {copiedKey === `obs-${activeSlide.id}` ? '✓ Copied' : '📋 Copy OBS Link'}
                </button>
              </div>
            </div>

            {/* Quick Themes Presets */}
            {activeSlide.presets.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-black text-[#e4e6eb] uppercase tracking-wider mb-2.5">
                  ⚡ Quick Theme Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeSlide.presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset.colors)}
                      className="p-2.5 rounded-xl bg-[#18191a] hover:bg-[#3a3b3c] border border-[#3a3b3c] hover:border-[#1877f2] text-left transition flex flex-col justify-between group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white group-hover:text-[#1877f2] transition truncate">
                        {preset.name}
                      </span>
                      <div className="flex items-center gap-1 mt-2">
                        {Object.values(preset.colors).slice(1, 5).map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Color Pickers */}
            <div>
              <label className="block text-xs font-black text-[#e4e6eb] uppercase tracking-wider mb-3">
                🎨 Individual Color Controls
              </label>
              <div className="space-y-3.5">
                {activeSlide.fields.map((field) => {
                  const currentColor = currentColors[field.key] || field.defaultVal;
                  return (
                    <div
                      key={field.key}
                      className="p-3.5 rounded-xl bg-[#18191a] border border-[#3a3b3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wide">
                            {field.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#b0b3b8] truncate mt-0.5">{field.desc}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border-2 border-[#3a3b3c] bg-transparent p-0 overflow-hidden"
                          title={`Pick color for ${field.label}`}
                        />

                        <input
                          type="text"
                          value={currentColor}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="w-24 px-2.5 py-1.5 rounded-xl bg-[#242526] border border-[#3a3b3c] text-white text-xs font-mono font-bold text-center uppercase focus:border-[#1877f2] focus:outline-none"
                          maxLength={7}
                        />

                        <button
                          type="button"
                          onClick={() => handleColorChange(field.key, field.defaultVal)}
                          className="w-8 h-8 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold transition border border-[#3a3b3c]"
                          title="Reset to default color"
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
                  Live Overlay Preview (Slide {activeSlide.id})
                </span>
              </div>
              
              {/* Preview Backdrop Modes */}
              <div className="flex items-center gap-1 bg-[#18191a] p-1 rounded-xl border border-[#3a3b3c] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBgMode('dark')}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg transition ${
                    bgMode === 'dark' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                  }`}
                  title="Studio canvas dark background"
                >
                  Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('transparent')}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg transition ${
                    bgMode === 'transparent' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                  }`}
                  title="OBS Transparent Checkerboard"
                >
                  OBS Grid
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('stream')}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg transition ${
                    bgMode === 'stream' ? 'bg-[#242526] text-white shadow' : 'text-[#b0b3b8] hover:text-white'
                  }`}
                  title="Simulated Game Stage"
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
    </main>
  );
}
