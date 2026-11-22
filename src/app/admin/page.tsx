'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import ColorPopover from '@/components/ColorPopover';
import SheetDataDrawer from '@/components/SheetDataDrawer';
import SheetConfigModal from '@/components/SheetConfigModal';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme, DEFAULT_THEMES } from '@/hooks/useBroadcastTheme';

// Import the 10 Pure Live Broadcast Slide Components
import Slide01PointsRace from '@/components/slides/Slide01PointsRace';
import Slide02PlayerClash from '@/components/slides/Slide02PlayerClash';
import Slide03WeaponRings from '@/components/slides/Slide03WeaponRings';
import Slide04TeamH2H from '@/components/slides/Slide04TeamH2H';
import Slide05GroupAverages from '@/components/slides/Slide05GroupAverages';
import Slide06SingleColumn from '@/components/slides/Slide06SingleColumn';
import Slide07FastRadar from '@/components/slides/Slide07FastRadar';
import Slide08KillsDmgLine from '@/components/slides/Slide08KillsDmgLine';
import Slide09RolePolar from '@/components/slides/Slide09RolePolar';
import Slide10DualColumn from '@/components/slides/Slide10DualColumn';

const SLIDES = [
  { id: 1, label: '01. Match 1–5 Points Race' },
  { id: 2, label: '02. 1v1 Player Clash' },
  { id: 3, label: '03. Weapon Meta Rings' },
  { id: 4, label: '04. Team H2H Match 5' },
  { id: 5, label: '05. Group Stage Averages' },
  { id: 6, label: '06. Single-Candle Dynamic Column' },
  { id: 7, label: '07. Top 2 / H2H Fast Radar' },
  { id: 8, label: '08. M1–M5 Kills & DMG Line' },
  { id: 9, label: '09. Role Dual Polar' },
  { id: 10, label: '10. Dual-Candle Comparison Column' },
];

export default function AdminPage() {
  const [currentSlide, setCurrentSlide] = useState(0); // 0-based index
  const [replayKey, setReplayKey] = useState(0);
  const [isAuto, setIsAuto] = useState(false);
  const [bgMode, setBgMode] = useState<'obs-grid' | 'obs-white' | 'obs-pure'>('obs-grid');
  const [syncStatus, setSyncStatus] = useState('● DRIVE LOGOS & FULL NUMBERS ACTIVE');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Floating Color Popover State
  const [popover, setPopover] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    group: string;
    key: string;
    label: string;
    initialColor: string;
    showExtras: boolean;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    group: 'global',
    key: 'textColor',
    label: '',
    initialColor: '#ffffff',
    showExtras: false,
  });

  const { sheetData, refreshNow } = useLiveSheetData();
  const { themes, saveThemeUpdates } = useBroadcastTheme();

  // Autoplay timer
  useEffect(() => {
    let timer: any;
    if (isAuto) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [isAuto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenColorPopover = useCallback(
    (e: React.MouseEvent, group: string, key: string, label: string) => {
      e.stopPropagation();
      const currentVal = (themes as any)?.[group]?.[key] || '#ffffff';
      setPopover({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        group,
        key,
        label,
        initialColor: currentVal,
        showExtras: false,
      });
    },
    [themes]
  );

  const handleColorChange = async (newColor: string) => {
    const updated = {
      [popover.group]: {
        ...((themes as any)[popover.group] || {}),
        [popover.key]: newColor,
      },
    };
    await saveThemeUpdates(updated);
  };

  const handleSyncDriveLogos = async () => {
    setSyncStatus('↻ SYNCING DRIVE LOGOS...');
    try {
      const res = await fetch('/api/logos/sync', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSyncStatus(`✓ SYNCED (${data.count} LOGOS)`);
        refreshNow();
      } else {
        setSyncStatus('⚠️ SYNC FAILED');
      }
    } catch {
      setSyncStatus('⚠️ NETWORK ERROR');
    }
    setTimeout(() => setSyncStatus('● DRIVE LOGOS & FULL NUMBERS ACTIVE'), 4000);
  };

  const handleApplyPreset = async (preset: 'rtb' | 'ffws' | 'cyber') => {
    let updates: any = {};
    if (preset === 'rtb') {
      updates = {
        global: { ...themes.global, boxBg: '#120824', boxBorder: '#a855f7' },
        s9: { ...themes.s9, kills: '#F5B700', damage: '#a855f7' },
      };
    } else if (preset === 'ffws') {
      updates = {
        global: { ...themes.global, boxBg: '#0a0c16', boxBorder: '#F5B700' },
        s9: { ...themes.s9, kills: '#F5B700', damage: '#2dd4bf' },
      };
    } else if (preset === 'cyber') {
      updates = {
        global: { ...themes.global, boxBg: '#04121c', boxBorder: '#22d3ee' },
        s9: { ...themes.s9, kills: '#22d3ee', damage: '#f43f5e' },
      };
    }
    await saveThemeUpdates(updates);
  };

  const handleResetThemes = async () => {
    if (confirm('Are you sure you want to reset all themes to default?')) {
      await saveThemeUpdates({ themes: DEFAULT_THEMES });
    }
  };

  const handleSaveSheetConfig = async (config: {
    sheetId: string;
    driveFolderId: string;
    apiKey?: string;
  }) => {
    await saveThemeUpdates({ config });
    setSyncStatus('✓ SHEET & API CONFIG APPLIED');
    refreshNow();
    setTimeout(() => setSyncStatus('● DRIVE LOGOS & FULL NUMBERS ACTIVE'), 4000);
  };

  const handleSelectSource = async (sourceId: string) => {
    const updatedSources = {
      ...(themes.sources || {}),
      [currentSlide]: sourceId,
    };
    await saveThemeUpdates({ sources: updatedSources });
  };

  const handleUpdateCustom = async (newCustom: any) => {
    await saveThemeUpdates({ custom: newCustom });
  };

  const handleLogout = async () => {
    if (confirm('Admin panel theke logout korben?')) {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.reload();
    }
  };

  const bgClasses = {
    'obs-grid': 'obs-grid',
    'obs-white': 'obs-white',
    'obs-pure': 'obs-pure',
  };

  return (
    <AuthGate onLogout={handleLogout}>
      <div
        className={`${bgClasses[bgMode]} min-h-screen flex flex-col justify-between p-3 sm:p-5 font-hud select-none`}
        onClick={() => setPopover((prev) => ({ ...prev, isOpen: false }))}
      >
        {/* Top Broadcast Control Bar */}
        <header id="topBar" className="max-w-[1440px] mx-auto w-full space-y-2 mb-2 z-40 relative">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/95 border border-purple-500/40 px-2.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
            {/* Mode Indicator & Live Link */}
            <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-xl border border-white/10">
              <span className="mode-btn-active px-3.5 py-1 rounded-lg font-hud text-sm font-bold tracking-wider">
                ⚙ ADMIN PANEL
              </span>
              <Link
                href={`/${currentSlide + 1}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1 rounded-lg font-hud text-sm font-bold tracking-wider text-slate-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5"
                title="Click to open pure transparent vMix window in new tab"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE vMIX PANEL{' '}
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-amber-300 text-xs">
                  /{currentSlide + 1}
                </span>
              </Link>
            </div>

            {/* Quick 1–10 Slide Selector Buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                className="w-8 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-purple-800 text-sm font-bold text-white cursor-pointer border border-white/10"
              >
                ◀
              </button>
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`slide-num-btn border border-white/10 cursor-pointer ${
                    currentSlide === idx
                      ? 'slide-num-active'
                      : 'bg-slate-900 hover:bg-purple-800 text-slate-200'
                  }`}
                  title={s.label}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                className="w-8 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-purple-800 text-sm font-bold text-white cursor-pointer border border-white/10"
              >
                ▶
              </button>
            </div>

            {/* Admin Utility Tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-800 border border-indigo-400/50 text-indigo-200 font-hud text-xs font-bold cursor-pointer"
              >
                ⚙ Sheet / API Config
              </button>
              <button
                type="button"
                onClick={handleSyncDriveLogos}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/85 hover:bg-emerald-800 border border-emerald-500/45 text-emerald-300 font-hud text-xs font-bold cursor-pointer"
              >
                ↻ Sync Drive Logos
              </button>
              <button
                type="button"
                onClick={() => setReplayKey((k) => k + 1)}
                className="px-3 py-1 rounded-lg bg-[#F5B700] hover:bg-amber-400 text-black font-hud font-bold text-sm cursor-pointer"
              >
                ↻ Replay
              </button>
              <button
                type="button"
                onClick={() => setIsAuto(!isAuto)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-hud font-bold text-sm cursor-pointer flex items-center gap-1.5 border border-white/10"
              >
                <span className={`w-2 h-2 rounded-full ${isAuto ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                <span>{isAuto ? 'Auto: ON (8s)' : 'Auto: OFF'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const modes: Array<'obs-grid' | 'obs-white' | 'obs-pure'> = ['obs-grid', 'obs-white', 'obs-pure'];
                  const nextIdx = (modes.indexOf(bgMode) + 1) % modes.length;
                  setBgMode(modes[nextIdx]);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-300 font-hud font-bold text-sm cursor-pointer border border-white/10"
              >
                BG: {bgMode === 'obs-grid' ? 'OBS Grid' : bgMode === 'obs-white' ? 'White Test' : 'Transparent'}
              </button>
            </div>
          </div>

          {/* Sub-Dock: Badge, Preset Buttons, Reset & Logout */}
          <div
            id="adminDock"
            className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-purple-500/35 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2 font-hud text-sm text-purple-200">
              <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-xs font-bold">
                SLIDE {String(currentSlide + 1).padStart(2, '0')}
              </span>
              <span className="font-bold text-white">
                {SLIDES[currentSlide].label.replace(/^\d+\.\s*/, '')}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                {syncStatus}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('rtb')}
                className="preset-btn px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-700 border border-purple-400/50 text-white font-hud text-xs font-bold cursor-pointer"
              >
                RTB Purple
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('ffws')}
                className="preset-btn px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-700 border border-amber-400/50 text-amber-200 font-hud text-xs font-bold cursor-pointer"
              >
                FFWS Gold
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('cyber')}
                className="preset-btn px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-400/50 text-cyan-200 font-hud text-xs font-bold cursor-pointer"
              >
                Neon Cyber
              </button>
              <button
                type="button"
                onClick={handleResetThemes}
                className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-hud text-xs font-bold cursor-pointer"
              >
                ↺ Reset
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-red-900 border border-red-500/40 text-red-300 font-hud text-xs font-bold cursor-pointer flex items-center gap-1"
                title="Logout and lock admin panel"
              >
                🔒 Lock
              </button>
            </div>
          </div>
        </header>

        {/* Floating Click-to-Edit Color Popover */}
        <ColorPopover
          isOpen={popover.isOpen}
          position={{ x: popover.x, y: popover.y }}
          label={popover.label}
          initialColor={popover.initialColor}
          showExtras={popover.showExtras}
          onColorChange={handleColorChange}
          onClose={() => setPopover((prev) => ({ ...prev, isOpen: false }))}
          onSelectGlobalText={() => {
            setPopover((prev) => ({
              ...prev,
              group: 'global',
              key: 'textColor',
              label: 'All Text Color',
              initialColor: themes.global?.textColor || '#ffffff',
            }));
          }}
          onSelectGlobalBox={() => {
            setPopover((prev) => ({
              ...prev,
              group: 'global',
              key: 'boxBg',
              label: 'Black Box Background',
              initialColor: themes.global?.boxBg || '#0a0c16',
            }));
          }}
        />

        {/* Dynamic Sheet ID / API Config Modal */}
        <SheetConfigModal
          isOpen={isConfigModalOpen}
          currentSheetId={sheetData?.meta?.sheetId || '1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE'}
          currentDriveId={sheetData?.meta?.driveFolderId || ''}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveSheetConfig}
        />

        {/* Collapsible Right-Side Sheet Data Source Switcher Drawer */}
        <SheetDataDrawer
          currentSlide={currentSlide}
          slideTitle={SLIDES[currentSlide].label}
          activeSourceId={themes?.sources?.[currentSlide] || ''}
          customSettings={themes?.custom || {}}
          sheetData={sheetData}
          onSelectSource={handleSelectSource}
          onUpdateCustom={handleUpdateCustom}
        />

        {/* Main Stage with Click-to-Edit Interactive Slide Component */}
        <main
          id="stage"
          key={replayKey}
          className="flex-1 flex items-center justify-center w-full max-w-[1440px] min-h-[calc(100vh-84px)] mx-auto px-2 sm:px-6 py-2 relative"
        >
          {currentSlide === 0 && (
            <Slide01PointsRace
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 1 && (
            <Slide02PlayerClash
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 2 && (
            <Slide03WeaponRings
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 3 && (
            <Slide04TeamH2H
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 4 && (
            <Slide05GroupAverages
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 5 && (
            <Slide06SingleColumn
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 6 && (
            <Slide07FastRadar
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 7 && (
            <Slide08KillsDmgLine
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 8 && (
            <Slide09RolePolar
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
          {currentSlide === 9 && (
            <Slide10DualColumn
              sheetData={sheetData}
              theme={themes}
              onElementClick={handleOpenColorPopover}
            />
          )}
        </main>
      </div>
    </AuthGate>
  );
}
